#!/usr/bin/env python3
"""
Automated Merge Conflict Resolver for websitev2 (main <-> upstream/main)

This script resolves all merge conflicts between the local redesign branch (main)
and the upstream repository (upstream/main), preserving:
1. The modern visual redesign, styling, layouts, and local asset paths from main.
2. All upstream vulnerability mitigations (rel="noopener noreferrer", directory listing index.html, .htaccess, .gitignore, 403/404, nginx.conf).
3. All upstream content additions (event coordinator phone numbers, latest Cybersecurity Workshop speakers/talks, Sanidhiyaa's full name).
"""

import os
import re
import subprocess
import sys

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        print(f"Error running: {cmd}\n{result.stderr}")
        sys.exit(result.returncode)
    return result.stdout.strip()

def get_conflicted_files():
    out = run_cmd("git diff --name-only --diff-filter=U")
    return [line.strip() for line in out.splitlines() if line.strip()]

def add_noopener_noreferrer(html_content):
    """Ensure any <a ... target="_blank" ...> has rel="noopener noreferrer"."""
    def replacer(match):
        tag = match.group(0)
        # Check if rel is already present
        rel_match = re.search(r'rel=[\"\']([^\"\']*)[\"\']', tag, re.IGNORECASE)
        if rel_match:
            rel_val = rel_match.group(1)
            tokens = set(rel_val.lower().split())
            tokens.add('noopener')
            tokens.add('noreferrer')
            new_rel = f'rel="{" ".join(sorted(tokens))}"'
            tag = tag[:rel_match.start()] + new_rel + tag[rel_match.end():]
        else:
            # Insert rel="noopener noreferrer" before closing >
            tag = tag[:-1].rstrip() + ' rel="noopener noreferrer">'
        return tag

    # Regex matches opening <a tag with target="_blank"
    pattern = re.compile(r'<a\s+[^>]*?target=[\"\']_blank[\"\'][^>]*?>', re.IGNORECASE | re.DOTALL)
    return pattern.sub(replacer, html_content)

def resolve_all():
    conflicted = get_conflicted_files()
    if not conflicted:
        print("No conflicted files detected!")
        return

    print(f"Detected {len(conflicted)} conflicted files:")
    for f in conflicted:
        print(f"  - {f}")

    # Step 1: Default resolution
    # Most files keep HEAD's redesigned layout
    # events/cybersecurity-workshop/index.html takes upstream's version (with Pratik's topic)
    for f in conflicted:
        if f == "events/cybersecurity-workshop/index.html":
            print(f"Resolving {f} using upstream/main (theirs)...")
            run_cmd(f"git checkout --theirs -- '{f}'")
        else:
            print(f"Resolving {f} using HEAD redesign (ours)...")
            run_cmd(f"git checkout --ours -- '{f}'")

    # Step 2: Apply specific upstream content updates onto HEAD's files

    # 1. team.html: Update Sanidhiyaa's full name
    team_file = "team.html"
    if os.path.exists(team_file):
        with open(team_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("<h3>Sanidhiyaa</h3>", "<h3>Sanidhiyaa Sriman Satpathy</h3>")
        with open(team_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated team.html with Sanidhiyaa Sriman Satpathy")

    # 2. events/flutterverse.html: Add student coordinator phone numbers and mobile icon
    flutter_file = "events/flutterverse.html"
    if os.path.exists(flutter_file):
        with open(flutter_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        old_adithiaya = """                    <div class="card text-center">
                        <div class="card-icon" style="font-size: 3rem; margin-bottom: 1rem;">💻</div>
                        <h3>Adithiaya Murugan K S</h3>
                        <p style="color: var(--gold-primary); font-weight: 600;">Student Coordinator</p>
                    </div>"""
        new_adithiaya = """                    <div class="card text-center">
                        <div class="card-icon" style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                        <h3>Adithiaya Murugan K S</h3>
                        <p style="color: var(--gold-primary); font-weight: 600;">Student Coordinator</p>
                        <p style="opacity: 0.7;">8925025737</p>
                    </div>"""
        old_faheem = """                    <div class="card text-center">
                        <div class="card-icon" style="font-size: 3rem; margin-bottom: 1rem;">💻</div>
                        <h3>Faheem Abdullah A</h3>
                        <p style="color: var(--gold-primary); font-weight: 600;">Student Coordinator</p>
                    </div>"""
        new_faheem = """                    <div class="card text-center">
                        <div class="card-icon" style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                        <h3>Faheem Abdullah A</h3>
                        <p style="color: var(--gold-primary); font-weight: 600;">Student Coordinator</p>
                        <p style="opacity: 0.7;">9150526725</p>
                    </div>"""
        content = content.replace(old_adithiaya, new_adithiaya).replace(old_faheem, new_faheem)
        with open(flutter_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated events/flutterverse.html with coordinator phone numbers")

    # 3. EventsDetails/codepulse-10-march.html
    cp10_file = "EventsDetails/codepulse-10-march.html"
    if os.path.exists(cp10_file):
        with open(cp10_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("📱 Anirudh S K<br>", "📱 Anirudh S K- 6380144092<br>")
        content = content.replace("📱 Lakshhmi Narayanan<br>", "📱 Lakshhmi Narayanan - 9176972967<br>")
        with open(cp10_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated EventsDetails/codepulse-10-march.html with phone numbers")

    # 4. EventsDetails/codepulse-7-july.html
    cp7_file = "EventsDetails/codepulse-7-july.html"
    if os.path.exists(cp7_file):
        with open(cp7_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("subbulakshmi.t@vit.ac.in</a><br><br>", "subbulakshmi.t@vit.ac.in</a><br>\n                                            📞 +91 99941 63259<br><br>")
        content = content.replace("👥 Archisha Sahai<br>", "📱 Archisha Sahai - 6386136485<br>")
        content = content.replace("👥 Mohan Ram Sridhar<br>", "📱 Mohan Ram Sridhar - 8825466893<br>")
        with open(cp7_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated EventsDetails/codepulse-7-july.html with phone numbers")

    # 5. EventsDetails/codepulse-8-march.html
    cp8_file = "EventsDetails/codepulse-8-march.html"
    if os.path.exists(cp8_file):
        with open(cp8_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("📱 Joel Joy Dennis<br>", "📱 Joel Joy Dennis - 9740671415<br>")
        content = content.replace("📱 K Nischay<br>", "📱 K Nischay - 9059013735<br>")
        with open(cp8_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated EventsDetails/codepulse-8-march.html with phone numbers")

    # 6. EventsDetails/codepulse-9-march.html
    cp9_file = "EventsDetails/codepulse-9-march.html"
    if os.path.exists(cp9_file):
        with open(cp9_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("📱 Drona Srivastava<br>", "📱 Drona Srivastava- 9104461613<br>")
        content = content.replace("📱 Archita Gupta<br>", "📱 Archita Gupta - 7390823826<br>")
        with open(cp9_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated EventsDetails/codepulse-9-march.html with phone numbers")

    # 7. EventsDetails/frontend_kickstart.html
    fk_file = "EventsDetails/frontend_kickstart.html"
    if os.path.exists(fk_file):
        with open(fk_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("👨‍💻 Sanjay S<br>", "👨‍💻 Sanjay S: +91 63804 37118<br>")
        content = content.replace("👨‍💻 Jeeva M<br>", "👨‍💻 Jeeva M: +91 94457 37120<br>")
        content = content.replace("👨‍💻 Benjamin A<br>", "👨‍💻 Benjamin A: +91 98403 49633<br>")
        with open(fk_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated EventsDetails/frontend_kickstart.html with phone numbers")

    # 8. EventsDetails/poster-design.html
    pd_file = "EventsDetails/poster-design.html"
    if os.path.exists(pd_file):
        with open(pd_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("Krishna Prasaad,\n                        Dhaarani Pushpam</span>", "Krishna Prasaad (9442042277),\n                        Dhaarani Pushpam(9344267871)</span>")
        content = content.replace("Krishna Prasaad,\r\n                        Dhaarani Pushpam</span>", "Krishna Prasaad (9442042277),\n                        Dhaarani Pushpam(9344267871)</span>")
        with open(pd_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated EventsDetails/poster-design.html with phone numbers")

    # 9. EventsDetails/rubix.html
    rx_file = "EventsDetails/rubix.html"
    if os.path.exists(rx_file):
        with open(rx_file, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace("Krishna Priyadarshan 📱 Archita Gupta 🚀", "Krishna Priyadarshan: 7005697446 📱 Archita Gupta: +91 73908 23826 🚀")
        with open(rx_file, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("Updated EventsDetails/rubix.html with phone numbers")

    # Step 3: Sanitize rel="noopener noreferrer" across all HTML files
    html_files = []
    for root, dirs, files in os.walk("."):
        if ".git" in root:
            continue
        for file in files:
            if file.endswith(".html"):
                html_files.append(os.path.join(root, file))

    updated_rel_count = 0
    for hf in html_files:
        with open(hf, "r", encoding="utf-8", errors="ignore") as fp:
            original = fp.read()
        sanitized = add_noopener_noreferrer(original)
        if sanitized != original:
            with open(hf, "w", encoding="utf-8") as fp:
                fp.write(sanitized)
            updated_rel_count += 1

    print(f"Sanitized rel attributes across {updated_rel_count} HTML files.")

    # Step 4: Add all resolved files to git index
    run_cmd("git add -A")
    print("All files staged in git index.")

    # Step 5: Verification of zero conflict markers
    check_markers = subprocess.run(
        "git grep -n -E '^(<{7} |={7}$|>{7} )' -- ':!.git'",
        shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    if check_markers.stdout.strip():
        print("WARNING: Conflict markers found:")
        print(check_markers.stdout)
        sys.exit(1)
    else:
        print("SUCCESS: 0 conflict markers found in repository.")

if __name__ == "__main__":
    resolve_all()
