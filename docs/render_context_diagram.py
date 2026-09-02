from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 2400, 1480
img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)

FONT_DIR = Path(r"C:\Windows\Fonts")
title_font = ImageFont.truetype(str(FONT_DIR / "arialbd.ttf"), 28)
entity_font = ImageFont.truetype(str(FONT_DIR / "arialbd.ttf"), 18)
zero_font = ImageFont.truetype(str(FONT_DIR / "arialbd.ttf"), 36)
process_font = ImageFont.truetype(str(FONT_DIR / "arialbd.ttf"), 20)
label_font = ImageFont.truetype(str(FONT_DIR / "arial.ttf"), 15)

BLACK = (17, 17, 17)


def text_size(font, text):
    bbox = font.getbbox(text)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_centered_text(x1, y1, x2, y2, text, font, wrap_width=None):
    words = text.split()
    lines = []
    if wrap_width:
        current = ""
        for word in words:
            trial = f"{current} {word}".strip()
            tw, _ = text_size(font, trial)
            if tw <= wrap_width or not current:
                current = trial
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
    else:
        lines = [text]

    heights = [text_size(font, line)[1] for line in lines]
    total_h = sum(heights) + (len(lines) - 1) * 6
    y = y1 + (y2 - y1 - total_h) / 2
    for line, lh in zip(lines, heights):
        tw, _ = text_size(font, line)
        x = x1 + (x2 - x1 - tw) / 2
        draw.text((x, y), line, fill=BLACK, font=font)
        y += lh + 6


def rounded_rect(xy, radius, width=3):
    draw.rounded_rectangle(xy, radius=radius, outline=BLACK, width=width)


def rect(xy, width=3):
    draw.rectangle(xy, outline=BLACK, width=width)


def arrowhead(tip, direction, size=8):
    x, y = tip
    if direction == "right":
        pts = [(x, y), (x - size, y - size * 0.7), (x - size, y + size * 0.7)]
    else:
        pts = [(x, y), (x + size, y - size * 0.7), (x + size, y + size * 0.7)]
    draw.polygon(pts, fill=BLACK)


def draw_flow(x1, x2, y, label, direction, side):
    draw.line([(x1, y), (x2, y)], fill=BLACK, width=2)
    if direction == "in":
        if side == "left":
            arrowhead((x2, y), "right")
        else:
            arrowhead((x1, y), "left")
    else:
        if side == "left":
            arrowhead((x1, y), "left")
        else:
            arrowhead((x2, y), "right")

    tw, th = text_size(label_font, label)
    label_y = y - th - 4
    if side == "left":
        label_x = x2 - 18 - tw
        if label_x < x1 + 4:
            label_x = x1 + 4
    else:
        label_x = x1 + 18
        if label_x + tw > x2 - 4:
            label_x = x2 - 4 - tw
    draw.text((label_x, label_y), label, fill=BLACK, font=label_font)


title = "Context Diagram of ADAMS: ACCREDITATION DOCUMENT ARCHIVING AND MANAGEMENT SYSTEM"
tw, th = text_size(title_font, title)
draw.text(((W - tw) / 2, 24), title, fill=BLACK, font=title_font)

PROCESS = (1020, 90, 1380, 1410)
rounded_rect(PROCESS, radius=22, width=4)
draw.line([(1020, 150), (1380, 150)], fill=BLACK, width=3)
draw_centered_text(1020, 90, 1380, 150, "0", zero_font)
draw_centered_text(
    1040,
    170,
    1360,
    1390,
    "ADAMS: ACCREDITATION DOCUMENT ARCHIVING AND MANAGEMENT SYSTEM",
    process_font,
    wrap_width=300,
)

LEFT_X1, LEFT_X2 = 40, 250
RIGHT_X1, RIGHT_X2 = 2150, 2360
LEFT_ARROW_X1, LEFT_ARROW_X2 = 258, 1012
RIGHT_ARROW_X1, RIGHT_ARROW_X2 = 1388, 2142

BOX_H = 92
entities = [
    {
        "name": "DEAN",
        "side": "left",
        "flows": [
            ("in", "Request Document / Compliance Status"),
            ("out", "Login Result"),
            ("in", "Login Data / 2FA"),
            ("out", "Assigned Task and Reminders"),
            ("in", "Program Setup / Chair Assignment"),
            ("out", "College Readiness Dashboard"),
            ("in", "Task Assignment / Reminders"),
            ("out", "Documents / Compliance Status"),
            ("in", "Approve / Return Documents"),
            ("out", "Notification / Alerts"),
            ("in", "Reports Data Query"),
            ("out", "Reports / Audit logs"),
        ],
        "flow_top": 118,
    },
    {
        "name": "FACULTY",
        "side": "left",
        "flows": [
            ("out", "Login Result"),
            ("in", "Login / Register / Join Team Code"),
            ("out", "Upload Confirmation"),
            ("in", "Document Upload / Update"),
            ("out", "Submission / Review Status"),
            ("in", "Evidence Tagged to Area / Parameter"),
            ("out", "Assigned Tasks and Deadlines"),
            ("in", "Task Submit / Revision"),
            ("out", "Personal Document Vault"),
        ],
        "flow_top": 560,
    },
    {
        "name": "VPAA / DI",
        "side": "left",
        "flows": [
            ("in", "Accreditation Cycle / Instruments"),
            ("out", "Login Result"),
            ("in", "Schedule / Validity Monitoring"),
            ("out", "Institutional Readiness Dashboard"),
            ("in", "At-Risk / Institutional Reports"),
            ("out", "Schedule / Validity Status"),
            ("in", "Consolidated Reports"),
            ("out", "Accreditation Monitoring Report"),
            ("in", "Login Data / 2FA"),
            ("out", "Consolidated Reports and Analytics"),
        ],
        "flow_top": 1020,
    },
    {
        "name": "AREA IN-CHARGES",
        "side": "right",
        "flows": [
            ("out", "Login Result"),
            ("in", "Parameter / Row Content"),
            ("out", "Assigned Areas and Progress"),
            ("in", "Evidence Upload"),
            ("out", "Compliance Status Information"),
            ("in", "Compliance Task Create / Update"),
            ("out", "Area Requirements"),
            ("in", "Submit for Review"),
            ("out", "Assigned Tasks and Reminders"),
            ("in", "Login Data / 2FA"),
        ],
        "flow_top": 118,
    },
    {
        "name": "PROGRAM CHAIR",
        "side": "right",
        "flows": [
            ("out", "Login Result"),
            ("in", "Login Data / 2FA"),
            ("out", "Program Status Dashboard"),
            ("in", "Faculty Area Assignments"),
            ("out", "Faculty Tracking / Reminders"),
            ("in", "Team Codes / Invitations"),
            ("out", "Pending Review Queue"),
            ("in", "Upload Verification / Approve Return"),
            ("out", "Revision History Logs"),
            ("in", "Revision Feedback"),
            ("out", "Notification / Audit Logs"),
            ("in", "Program Reports"),
        ],
        "flow_top": 545,
    },
    {
        "name": "QUALITY ASSURANCE (QA)",
        "side": "right",
        "flows": [
            ("out", "Login Result"),
            ("in", "University-wide Compliance Request"),
            ("out", "Accreditation Readiness Status"),
            ("in", "College Comparison Request"),
            ("out", "College Comparison Reports"),
            ("in", "Program Readiness / At-Risk Request"),
            ("out", "Program Readiness / At-Risk Reports"),
            ("in", "Area Progress Query"),
            ("out", "Audit Logs and Records"),
            ("in", "Login Data / 2FA"),
        ],
        "flow_top": 1020,
    },
]

for entity in entities:
    last_y = entity["flow_top"] + (len(entity["flows"]) - 1) * 32
    mid = (entity["flow_top"] + last_y) / 2
    if entity["side"] == "left":
        box = (LEFT_X1, mid - BOX_H / 2, LEFT_X2, mid + BOX_H / 2)
    else:
        box = (RIGHT_X1, mid - BOX_H / 2, RIGHT_X2, mid + BOX_H / 2)
    entity["box"] = box
    rect(box, width=3)
    x1, y1, x2, y2 = box
    draw_centered_text(x1 + 6, y1, x2 - 6, y2, entity["name"], entity_font, wrap_width=190)
    y = entity["flow_top"]
    for direction, label in entity["flows"]:
        if entity["side"] == "left":
            draw_flow(LEFT_ARROW_X1, LEFT_ARROW_X2, y, label, direction, "left")
        else:
            draw_flow(RIGHT_ARROW_X1, RIGHT_ARROW_X2, y, label, direction, "right")
        y += 32

outputs = [
    Path(r"C:\project\capstone_project\docs\adams-context-diagram.png"),
    Path(r"C:\Users\jade0\.cursor\projects\c-capstone-backend-backend-app\assets\adams-context-diagram.png"),
]
for path in outputs:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")
    print(f"saved {path}")
