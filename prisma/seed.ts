import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("🌱  Seeding BigSeaa demo data…");

  // --- Clean (idempotent reseed) -------------------------------------------
  await prisma.$transaction([
    prisma.quotation.deleteMany(),
    prisma.rfq.deleteMany(),
    prisma.productPrice.deleteMany(),
    prisma.product.deleteMany(),
    prisma.companyDocument.deleteMany(),
    prisma.supplierUnlock.deleteMany(),
    prisma.supplierProfile.deleteMany(),
    prisma.buyerProfile.deleteMany(),
    prisma.creditAccount.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.notificationSettings.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.savedItem.deleteMany(),
    prisma.user.deleteMany(),
    prisma.category.deleteMany(),
    prisma.port.deleteMany(),
    prisma.country.deleteMany(),
    prisma.faq.deleteMany(),
    prisma.cmsPage.deleteMany(),
  ]);

  // --- Countries & ports ----------------------------------------------------
  const countryData = [
    { code: "US", name: "United States", currency: "USD", dialCode: "+1" },
    { code: "CN", name: "China", currency: "CNY", dialCode: "+86" },
    { code: "IN", name: "India", currency: "INR", dialCode: "+91" },
    { code: "DE", name: "Germany", currency: "EUR", dialCode: "+49" },
    { code: "AE", name: "United Arab Emirates", currency: "AED", dialCode: "+971" },
    { code: "VN", name: "Vietnam", currency: "VND", dialCode: "+84" },
  ];
  const countries: Record<string, string> = {};
  for (const c of countryData) {
    const created = await prisma.country.create({ data: c });
    countries[c.code] = created.id;
  }
  await prisma.port.createMany({
    data: [
      { countryId: countries.CN, name: "Port of Shanghai", code: "CNSHA" },
      { countryId: countries.CN, name: "Port of Shenzhen", code: "CNSZX" },
      { countryId: countries.IN, name: "Nhava Sheva (JNPT)", code: "INNSA" },
      { countryId: countries.DE, name: "Port of Hamburg", code: "DEHAM" },
      { countryId: countries.AE, name: "Jebel Ali", code: "AEJEA" },
      { countryId: countries.VN, name: "Cat Lai", code: "VNCLI" },
    ],
  });

  // --- Categories (parent + children) --------------------------------------
  const categoryTree: { name: string; children: string[] }[] = [
    { name: "Industrial Equipment", children: ["Pumps & Valves", "CNC Machinery", "Generators"] },
    { name: "Textiles & Apparel", children: ["Cotton Fabric", "Activewear", "Leather Goods"] },
    { name: "Electronics", children: ["PCB & Components", "Consumer Electronics", "Batteries"] },
    { name: "Food & Beverage", children: ["Spices", "Packaged Foods", "Beverages"] },
    { name: "Construction", children: ["Steel & Metals", "Tiles & Ceramics", "Safety Gear"] },
  ];
  const childCategoryIds: { id: string; name: string }[] = [];
  for (let i = 0; i < categoryTree.length; i++) {
    const parent = await prisma.category.create({
      data: { name: categoryTree[i].name, slug: slugify(categoryTree[i].name), order: i },
    });
    for (let j = 0; j < categoryTree[i].children.length; j++) {
      const child = await prisma.category.create({
        data: {
          name: categoryTree[i].children[j],
          slug: slugify(categoryTree[i].children[j]),
          parentId: parent.id,
          order: j,
        },
      });
      childCategoryIds.push({ id: child.id, name: child.name });
    }
  }

  // --- Demo users (buyer / supplier / admin) -------------------------------
  const password = await bcrypt.hash("Password123!", 10);

  await prisma.user.create({
    data: {
      email: "admin@bigseaa.com",
      name: "Site Admin",
      passwordHash: password,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      creditAccount: { create: { balance: 0 } },
      notifSettings: { create: {} },
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: "buyer@bigseaa.com",
      name: "Bella Buyer",
      passwordHash: password,
      role: "BUYER",
      activeMode: "BUYER",
      status: "ACTIVE",
      emailVerified: new Date(),
      phone: "+15551234567",
      phoneVerified: true,
      buyerProfile: { create: { company: "Atlas Retail Group", countryId: countries.US } },
      creditAccount: { create: { balance: 25 } },
      notifSettings: { create: { email: true } },
    },
  });

  // --- Suppliers with profiles + products ----------------------------------
  const supplierSeeds = [
    {
      email: "acme@bigseaa.com",
      name: "Acme Industrial",
      company: "Acme Industrial Co.",
      country: "CN",
      about: "ISO-certified manufacturer of industrial pumps, valves and CNC machinery since 1998.",
      strength: "OEM/ODM · 5,000+ sqm factory · 200 staff",
      verified: true,
      products: [
        { title: "High-Pressure Centrifugal Pump HP-450", cat: "Pumps & Valves", price: 1240, moq: 5 },
        { title: "3-Axis CNC Milling Machine VMC-850", cat: "CNC Machinery", price: 18500, moq: 1 },
      ],
    },
    {
      email: "lotus@bigseaa.com",
      name: "Lotus Textiles",
      company: "Lotus Textiles Pvt. Ltd.",
      country: "IN",
      about: "Vertically integrated cotton fabric and activewear manufacturer exporting to 30+ countries.",
      strength: "GOTS certified · 12,000 sqm · in-house dyeing",
      verified: true,
      products: [
        { title: "Organic Combed Cotton Fabric 180 GSM", cat: "Cotton Fabric", price: 3.2, moq: 500 },
        { title: "Performance Activewear Tee (Blank)", cat: "Activewear", price: 4.8, moq: 300 },
      ],
    },
    {
      email: "voltedge@bigseaa.com",
      name: "VoltEdge Electronics",
      company: "VoltEdge Electronics GmbH",
      country: "DE",
      about: "Precision PCB assembly and Li-ion battery pack manufacturing for industrial clients.",
      strength: "IPC-A-610 · automotive-grade QA",
      verified: false,
      products: [
        { title: "4-Layer Industrial PCB (Custom)", cat: "PCB & Components", price: 12.5, moq: 100 },
        { title: "18650 Li-ion Battery Pack 48V", cat: "Batteries", price: 86, moq: 20 },
      ],
    },
    {
      email: "saffron@bigseaa.com",
      name: "Saffron Foods",
      company: "Saffron Foods Trading LLC",
      country: "AE",
      about: "Premium spices and packaged foods sourced and re-exported across MENA and Europe.",
      strength: "HACCP · halal certified · cold-chain",
      verified: true,
      products: [
        { title: "Premium Saffron Threads (Grade A1)", cat: "Spices", price: 1450, moq: 2 },
        { title: "Cold-Pressed Olive Oil 5L (Bulk)", cat: "Packaged Foods", price: 22, moq: 100 },
      ],
    },
    {
      email: "titan@bigseaa.com",
      name: "Titan BuildMat",
      company: "Titan Building Materials JSC",
      country: "VN",
      about: "Structural steel, ceramic tiles and certified safety gear for large construction projects.",
      strength: "ASTM compliant · 50,000 MT/yr capacity",
      verified: true,
      products: [
        { title: "Hot-Rolled Structural Steel Beam (I-Section)", cat: "Steel & Metals", price: 720, moq: 10 },
        { title: "Porcelain Floor Tile 600x600 (Matte)", cat: "Tiles & Ceramics", price: 6.4, moq: 1000 },
      ],
    },
  ];

  const catByName = new Map(childCategoryIds.map((c) => [c.name, c.id]));
  const supplierProfiles: { id: string; userId: string; country: string }[] = [];

  for (const s of supplierSeeds) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        passwordHash: password,
        role: "SUPPLIER",
        activeMode: "SUPPLIER",
        status: "ACTIVE",
        emailVerified: new Date(),
        creditAccount: { create: { balance: 10 } },
        notifSettings: { create: {} },
        supplierProfile: {
          create: {
            companyName: s.company,
            slug: slugify(s.company),
            about: s.about,
            strength: s.strength,
            countryId: countries[s.country],
            contactEmail: s.email,
            verificationStatus: s.verified ? "VERIFIED" : "PENDING",
            verifiedBadge: s.verified,
            paymentTerms: "T/T, L/C at sight",
            shippingTerms: "FOB / CIF",
          },
        },
      },
      include: { supplierProfile: true },
    });
    const profile = user.supplierProfile!;
    supplierProfiles.push({ id: profile.id, userId: user.id, country: s.country });

    for (const p of s.products) {
      await prisma.product.create({
        data: {
          supplierId: profile.id,
          categoryId: catByName.get(p.cat),
          title: p.title,
          slug: slugify(p.title) + "-" + Math.floor(p.price),
          description: `${p.title} from ${s.company}. ${s.strength}. MOQ ${p.moq}. Customization available; samples on request.`,
          moq: p.moq,
          basePrice: p.price,
          baseCurrency: "USD",
          images: [],
          status: "ACTIVE",
        },
      });
    }
  }

  // --- Sample RFQs + a quotation -------------------------------------------
  const rfq = await prisma.rfq.create({
    data: {
      buyerId: buyer.id,
      title: "Bulk order: organic cotton t-shirts (5,000 units)",
      description:
        "Looking for a verified supplier for 5,000 organic cotton blank tees, 180 GSM, assorted sizes. Need OEKO-TEX or GOTS certification. Delivery to Los Angeles within 60 days.",
      categoryId: catByName.get("Activewear"),
      countryId: countries.US,
      budget: 24000,
      currency: "USD",
      quantity: 5000,
      moq: 300,
      status: "OPEN",
    },
  });
  await prisma.rfq.create({
    data: {
      buyerId: buyer.id,
      title: "CNC milling machine for aluminium parts",
      description: "Sourcing one 3-axis CNC VMC for an aluminium machining line. Need installation support.",
      categoryId: catByName.get("CNC Machinery"),
      countryId: countries.US,
      budget: 22000,
      currency: "USD",
      quantity: 1,
      status: "OPEN",
    },
  });

  const lotus = supplierProfiles.find((s) => s.country === "IN")!;
  await prisma.quotation.create({
    data: {
      rfqId: rfq.id,
      supplierId: lotus.id,
      userId: lotus.userId,
      price: 23500,
      currency: "USD",
      leadTime: "45 days",
      message: "GOTS certified. Price includes FOB Nhava Sheva. Samples ready in 7 days.",
      status: "PENDING",
    },
  });

  // --- FAQs & CMS pages -----------------------------------------------------
  await prisma.faq.createMany({
    data: [
      { question: "What is BigSeaa?", answer: "A global B2B marketplace connecting verified suppliers with buyers through product listings, RFQs and quotations.", category: "General", order: 1 },
      { question: "How do I post an RFQ?", answer: "Create a free buyer account, click 'Post RFQ', describe your requirement, and verified suppliers will respond with quotations.", category: "Buyers", order: 2 },
      { question: "How are suppliers verified?", answer: "Suppliers submit company documents which our team reviews before granting a verified badge.", category: "Trust & Safety", order: 3 },
      { question: "What are credits used for?", answer: "Credits let buyers unlock supplier contact details. You can purchase credit packs from your dashboard.", category: "Credits", order: 4 },
    ],
  });
  await prisma.cmsPage.createMany({
    data: [
      { slug: "privacy-policy", title: "Privacy Policy", body: "This is the BigSeaa privacy policy. (Editable from the admin CMS.)", published: true },
      { slug: "terms-and-conditions", title: "Terms & Conditions", body: "These are the BigSeaa terms and conditions. (Editable from the admin CMS.)", published: true },
      { slug: "cookie-policy", title: "Cookie Policy", body: "This is the BigSeaa cookie policy. (Editable from the admin CMS.)", published: true },
    ],
  });

  // --- Saved items + notifications for the demo buyer --------------------
  const sampleProduct = await prisma.product.findFirst({
    where: { supplierId: lotus.id },
  });
  await prisma.savedItem.createMany({
    data: [
      { userId: buyer.id, type: "SUPPLIER", targetId: supplierProfiles[0].id },
      ...(sampleProduct
        ? [{ userId: buyer.id, type: "PRODUCT" as const, targetId: sampleProduct.id }]
        : []),
      { userId: buyer.id, type: "RFQ", targetId: rfq.id },
    ],
  });
  await prisma.notification.createMany({
    data: [
      {
        userId: buyer.id,
        type: "QUOTE_RECEIVED",
        title: "New quotation received",
        body: "Lotus Textiles sent a quote on your organic cotton t-shirts RFQ.",
      },
      {
        userId: buyer.id,
        type: "WELCOME",
        title: "Welcome to BigSeaa",
        body: "Complete your profile to get better supplier matches.",
      },
    ],
  });

  console.log("✅  Seed complete.");
  console.log("    Demo logins (password: Password123!):");
  console.log("    • admin@bigseaa.com   (admin)");
  console.log("    • buyer@bigseaa.com   (buyer)");
  console.log("    • acme@bigseaa.com    (supplier)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
