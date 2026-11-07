#!/bin/bash
set -e

if type update-alternatives >/dev/null 2>&1; then
  update-alternatives --remove 'glint' '/opt/Glint/glint' 2>/dev/null || true
fi

rm -f /usr/bin/glint 2>/dev/null || true

if hash update-desktop-database 2>/dev/null; then
  update-desktop-database -q /usr/share/applications 2>/dev/null || true
fi
if hash update-mime-database 2>/dev/null; then
  update-mime-database /usr/share/mime 2>/dev/null || true
fi
