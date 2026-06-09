#!/usr/bin/env python3
"""Generate a client-facing Project Documentation PDF for BigSeaa."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, PageBreak, ListFlowable, ListItem,
)

TEAL = colors.HexColor("#1B6E85")
TEAL_DARK = colors.HexColor("#0C3B49")
CORAL = colors.HexColor("#F0875A")
GREEN = colors.HexColor("#1E8E5A")
GREEN_BG = colors.HexColor("#E4F4EC")
LIGHT = colors.HexColor("#EAF2F4")
ZEBRA = colors.HexColor("#F6F9FA")
INK = colors.HexColor("#222222")
GREY = colors.HexColor("#5B6B73")

PAGE_W, PAGE_H = A4
DATE = "June 2026"

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], textColor=TEAL_DARK,
                    fontName="Helvetica-Bold", fontSize=17, spaceBefore=6, spaceAfter=8)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=TEAL,
                    fontName="Helvetica-Bold", fontSize=12.5, spaceBefore=10, spaceAfter=4)
BODY = ParagraphStyle("BODY", parent=styles["BodyText"], textColor=INK,
                      fontName="Helvetica", fontSize=10, leading=15, spaceAfter=6)
BULLET = ParagraphStyle("BULLET", parent=BODY, fontSize=9.7, leading=14, spaceAfter=2)
LEAD = ParagraphStyle("LEAD", parent=BODY, fontSize=11, leading=16, textColor=GREY)
CELL = ParagraphStyle("CELL", parent=BODY, fontSize=9, leading=12, spaceAfter=0)
CELLB = ParagraphStyle("CELLB", parent=CELL, fontName="Helvetica-Bold", textColor=TEAL_DARK)
WHITEB = ParagraphStyle("WHITEB", parent=CELL, fontName="Helvetica-Bold", textColor=colors.white)


def cover(canvas, doc):
    canvas.saveState()
    # top band
    canvas.setFillColor(TEAL)
    canvas.rect(0, PAGE_H - 150 * mm, PAGE_W, 150 * mm, fill=1, stroke=0)
    canvas.setFillColor(TEAL_DARK)
    canvas.rect(0, PAGE_H - 150 * mm, PAGE_W, 8 * mm, fill=1, stroke=0)
    # logo mark
    cx, cy = 28 * mm, PAGE_H - 40 * mm
    canvas.setFillColor(colors.white)
    canvas.roundRect(cx, cy, 14 * mm, 14 * mm, 3 * mm, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawCentredString(cx + 7 * mm, cy + 4.4 * mm, "B")
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 20)
    canvas.drawString(cx + 19 * mm, cy + 4 * mm, "BigSeaa")
    # title
    canvas.setFont("Helvetica-Bold", 30)
    canvas.drawString(28 * mm, PAGE_H - 78 * mm, "Project Documentation")
    canvas.setFont("Helvetica", 14)
    canvas.drawString(28 * mm, PAGE_H - 90 * mm, "B2B Marketplace Platform")
    canvas.setFont("Helvetica-Oblique", 11)
    canvas.drawString(28 * mm, PAGE_H - 104 * mm,
                      "Verified supplier directory  ·  RFQ & quotation engine  ·  Credit economy")
    # meta box
    canvas.setFillColor(LIGHT)
    canvas.roundRect(28 * mm, PAGE_H - 205 * mm, PAGE_W - 56 * mm, 38 * mm, 3 * mm, fill=1, stroke=0)
    canvas.setFillColor(TEAL_DARK)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(36 * mm, PAGE_H - 178 * mm, "Prepared for:")
    canvas.drawString(36 * mm, PAGE_H - 188 * mm, "Date:")
    canvas.drawString(36 * mm, PAGE_H - 198 * mm, "Status:")
    canvas.setFont("Helvetica", 11)
    canvas.setFillColor(INK)
    canvas.drawString(70 * mm, PAGE_H - 178 * mm, "Client")
    canvas.drawString(70 * mm, PAGE_H - 188 * mm, DATE)
    canvas.setFillColor(GREEN)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(70 * mm, PAGE_H - 198 * mm, "All core features delivered & build-verified")
    # footer
    canvas.setFillColor(GREY)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(PAGE_W / 2, 14 * mm, "BigSeaa — Project Documentation  ·  Confidential")
    canvas.restoreState()


def content_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(TEAL)
    canvas.rect(0, PAGE_H - 16 * mm, PAGE_W, 16 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(20 * mm, PAGE_H - 11 * mm, "BigSeaa  ·  Project Documentation")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawCentredString(PAGE_W / 2, 12 * mm, f"Page {doc.page - 1}")
    canvas.drawRightString(PAGE_W - 20 * mm, 12 * mm, DATE)
    canvas.restoreState()


def tbl(data, widths, header=True):
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#D6DEE2")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), TEAL),
            ("TOPPADDING", (0, 0), (-1, 0), 7),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
        ]
        for r in range(2, len(data), 2):
            style.append(("BACKGROUND", (0, r), (-1, r), ZEBRA))
    t.setStyle(TableStyle(style))
    return t


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(t, BULLET), leftIndent=10, value="•") for t in items],
        bulletType="bullet", bulletColor=TEAL, leftIndent=6, spaceAfter=6,
    )


story = [PageBreak()]  # page 1 is the cover (drawn on canvas)

# ---- Executive summary -----------------------------------------------------
story.append(Paragraph("Executive Summary", H1))
story.append(Paragraph(
    "BigSeaa is a production-grade B2B marketplace that connects verified suppliers with "
    "buyers worldwide. Buyers discover suppliers and products with localized pricing, post "
    "Requests for Quotation (RFQs), and receive competitive quotes — using credits to unlock "
    "supplier contacts. Suppliers list products, respond to RFQs, and become verified. "
    "Administrators moderate the entire platform.", LEAD))
story.append(Paragraph(
    "The platform is built on a modern, SEO-first, fully type-safe technology stack and is "
    "delivered as a complete, build-verified application across three surfaces:", BODY))
story.append(bullets([
    "<b>Public website</b> — fast, search-engine-optimized pages that bring in organic buyers.",
    "<b>Member dashboards</b> — dedicated workspaces for buyers and suppliers.",
    "<b>Admin panel</b> — full moderation, verification and content management.",
]))

metrics = [
    [Paragraph("<b>42</b>", CELLB), Paragraph("Pages / screens", CELL),
     Paragraph("<b>3</b>", CELLB), Paragraph("User roles", CELL)],
    [Paragraph("<b>59</b>", CELLB), Paragraph("Delivered features", CELL),
     Paragraph("<b>8</b>", CELLB), Paragraph("Delivery phases (complete)", CELL)],
]
mt = Table(metrics, colWidths=[18*mm, 60*mm, 18*mm, 64*mm])
mt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ("BOX", (0, 0), (-1, -1), 0, colors.white), ("INNERGRID", (0, 0), (-1, -1), 3, colors.white),
]))
story.append(Spacer(1, 4))
story.append(mt)

# ---- What's delivered ------------------------------------------------------
story.append(Paragraph("What's Delivered", H1))
deliver = [
    [Paragraph("Surface", WHITEB), Paragraph("Highlights", WHITEB)],
    [Paragraph("Public Website", CELLB), Paragraph(
        "Animated home (3D hero), supplier directory & profiles, product catalog with advanced "
        "filters and multi-currency pricing, category system, FAQs, content pages, full SEO.", CELL)],
    [Paragraph("Buyer Dashboard", CELLB), Paragraph(
        "Post & manage RFQs, receive and accept/reject quotations, buy & spend credits, unlock "
        "supplier contacts, save items, notifications, profile & security settings.", CELL)],
    [Paragraph("Supplier Dashboard", CELLB), Paragraph(
        "Browse the RFQ feed and submit quotes, full product management, company profile, and "
        "document-based verification.", CELL)],
    [Paragraph("Admin Panel", CELLB), Paragraph(
        "User management with approve/block/impersonate, supplier verification queue, RFQ "
        "moderation, category/CMS/FAQ management, credit administration, and a full audit trail.", CELL)],
]
story.append(tbl(deliver, [38*mm, 122*mm]))

story.append(PageBreak())

# ---- Feature highlights ----------------------------------------------------
story.append(Paragraph("Feature Highlights", H1))
story.append(Paragraph("Buyer experience", H2))
story.append(bullets([
    "Post a Request for Quotation in minutes and manage it end-to-end.",
    "Compare quotations side by side and accept the best — suppliers are notified instantly.",
    "Unlock verified supplier contacts using a transparent credit system.",
    "Save suppliers, products and RFQs; manage notification preferences.",
]))
story.append(Paragraph("Supplier experience", H2))
story.append(bullets([
    "Discover relevant buyer requests in a live RFQ feed and submit competitive quotes.",
    "Maintain a full product catalog and a rich, public company profile.",
    "Build trust through document-based verification and a verified badge.",
]))
story.append(Paragraph("Administration & trust", H2))
story.append(bullets([
    "Approve, reject or block users; securely impersonate accounts for support.",
    "Review supplier documents and grant verified status.",
    "Moderate spam, manage categories, content pages, FAQs and credits.",
    "Every administrative action is recorded in an audit log.",
]))
story.append(Paragraph("Growth & discovery", H2))
story.append(bullets([
    "Search-engine-optimized pages (structured data, sitemaps) to attract organic buyers.",
    "Country-based pricing and currency conversion for a global audience.",
    "Multi-channel notifications: in-app, email, SMS, WhatsApp and Telegram.",
]))

# ---- Technology ------------------------------------------------------------
story.append(Paragraph("Technology Stack", H1))
story.append(Paragraph(
    "A modern, widely-adopted, all-TypeScript stack chosen for SEO, reliability and scale.", BODY))
tech = [[Paragraph("Area", WHITEB), Paragraph("Technology", WHITEB), Paragraph("Why", WHITEB)]]
for area, t, why in [
    ("Framework", "Next.js 16 / React 19", "SEO-friendly server rendering; one full-stack codebase"),
    ("Language", "TypeScript", "Type safety across the whole application"),
    ("Database", "PostgreSQL + Prisma", "Reliable relational data; type-safe access"),
    ("Authentication", "Auth.js (NextAuth)", "Email, Google SSO, roles, admin impersonation"),
    ("UI / Design", "Tailwind CSS + shadcn/ui", "Custom, accessible, modern interface"),
    ("Experience", "GSAP · Three.js · Lenis", "Premium animation, 3D and smooth scrolling"),
    ("Payments", "Stripe", "Secure credit-pack checkout"),
    ("Messaging", "Resend · Twilio · Telegram", "Email, SMS, WhatsApp and Telegram notifications"),
    ("Storage", "Cloudflare R2 / S3", "Documents and media"),
    ("Hosting", "Any Node.js host", "Deploys to Railway, Render, DigitalOcean, AWS, VPS…"),
]:
    tech.append([Paragraph(area, CELLB), Paragraph(t, CELL), Paragraph(why, CELL)])
story.append(tbl(tech, [34*mm, 56*mm, 70*mm]))

story.append(PageBreak())

# ---- How it works ----------------------------------------------------------
story.append(Paragraph("How It Works", H1))
story.append(Paragraph("The buyer → supplier loop", H2))
story.append(bullets([
    "1.  A buyer posts an RFQ describing what they need.",
    "2.  Verified suppliers see it in their feed and submit quotations.",
    "3.  The buyer compares quotes and accepts one — the supplier is notified and others are declined.",
    "4.  The buyer unlocks the supplier's contact details with credits to finalize the deal.",
]))
story.append(Paragraph("Trust & verification", H2))
story.append(bullets([
    "Suppliers submit company documents which administrators review.",
    "Approved suppliers receive a verified badge shown across the marketplace.",
    "Spam protection and moderation keep the platform clean.",
]))

# ---- Quality, security, SEO ------------------------------------------------
story.append(Paragraph("Quality, Security & SEO", H1))
qs = [[Paragraph("Area", WHITEB), Paragraph("What's in place", WHITEB)]]
for a, b in [
    ("Security", "Role-based access control, input validation, password hashing, "
                 "transaction-safe credits, secure payment webhooks, audit logging."),
    ("SEO", "Server-rendered pages, rich structured data (products, organizations, FAQs, "
            "breadcrumbs), dynamic sitemap and clean keyword-rich URLs."),
    ("Reliability", "Fully type-safe code, atomic database transactions, and a verified "
                    "production build."),
    ("Performance", "Optimized images and fonts, server streaming, and edge-cacheable pages."),
]:
    qs.append([Paragraph(a, CELLB), Paragraph(b, CELL)])
story.append(tbl(qs, [34*mm, 126*mm]))

# ---- Delivery phases -------------------------------------------------------
story.append(Paragraph("Delivery Phases", H1))
ph = [[Paragraph("Phase", WHITEB), Paragraph("Scope", WHITEB), Paragraph("Status", WHITEB)]]
for p, s in [
    ("0 — Foundation", "Setup, database, design system, authentication base"),
    ("1 — Public Site", "Listings, details, categories, filters, currency, SEO"),
    ("2 — Authentication", "Login, registration, Google SSO, supplier onboarding"),
    ("3 — Buyer Dashboard", "RFQs, quotations, saved items, credits, profile"),
    ("4 — Supplier Dashboard", "RFQ feed, quotes, products, company, verification"),
    ("5 — Payments & Credits", "Unlock flow, Stripe checkout, credit packs"),
    ("6 — Admin Panel", "Users, verification, CMS, FAQ, categories, credits"),
    ("7 — Notifications & Polish", "Notification center, final polish, documentation"),
]:
    ph.append([Paragraph(p, CELLB), Paragraph(s, CELL),
               Paragraph('<font color="#1E8E5A"><b>Completed</b></font>', CELL)])
story.append(tbl(ph, [44*mm, 96*mm, 20*mm]))

# ---- Deployment & handoff --------------------------------------------------
story.append(Paragraph("Deployment & Handoff", H1))
story.append(Paragraph(
    "The application is a standard Next.js project and can be deployed to any Node.js hosting "
    "provider (e.g. Railway, Render, DigitalOcean, AWS) or via Docker. To go live it needs:", BODY))
story.append(bullets([
    "A managed PostgreSQL database connection.",
    "Environment configuration (provided template).",
    "Optional service keys to activate live payments, email and SMS (Stripe, Resend, Twilio).",
]))
story.append(Paragraph(
    "Until those keys are added, payments are simulated and notifications are logged, so the "
    "full product can be demonstrated immediately.", BODY))
story.append(Spacer(1, 10))
story.append(Paragraph(
    '<font color="#1B6E85"><b>All core functionality is complete and verified. '
    'The platform is ready for demonstration and for production deployment.</b></font>', BODY))

# ---- Build -----------------------------------------------------------------
doc = BaseDocTemplate(
    "BigSeaa_Project_Documentation.pdf", pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm, topMargin=24*mm, bottomMargin=20*mm,
    title="BigSeaa — Project Documentation", author="BigSeaa",
)
frame = Frame(doc.leftMargin, doc.bottomMargin,
              doc.width, doc.height, id="body")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[frame], onPage=cover),
    PageTemplate(id="content", frames=[frame], onPage=content_page),
])
# Switch to content template after the cover.
from reportlab.platypus import NextPageTemplate
story.insert(0, NextPageTemplate("content"))
doc.build(story)
print("Saved: BigSeaa_Project_Documentation.pdf")
