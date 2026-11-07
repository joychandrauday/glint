#!/bin/bash
set -e

# Terminate any previously running Glint instances so upgrade takes immediate effect
killall glint.real 2>/dev/null || true
pkill -f "/opt/Glint/glint" 2>/dev/null || true

# Setup sandbox permissions
if [ -f "/opt/Glint/chrome-sandbox" ]; then
  chmod 4755 "/opt/Glint/chrome-sandbox" 2>/dev/null || true
fi

# Wrap /opt/Glint/glint so that whenever it is invoked (from bash, shortcuts, or desktop environments),
# it always boots cleanly with X11/XWayland flags from line 0, avoiding Ozone Wayland mismatches.
if [ -f "/opt/Glint/glint" ] && [ ! -f "/opt/Glint/glint.real" ]; then
  mv /opt/Glint/glint /opt/Glint/glint.real
  cat << 'EOF' > /opt/Glint/glint
#!/bin/bash
export LIBVA_MESSAGING_LEVEL=0
export ELECTRON_ENABLE_LOGGING=0
export ELECTRON_OZONE_PLATFORM_HINT=x11
exec /opt/Glint/glint.real \
  --ozone-platform=x11 \
  --enable-transparent-visuals \
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-gpu \
  --disable-features=VaapiVideoDecoder,VaapiVideoEncoder,VaapiIgnoreDriverChecks \
  --disable-accelerated-video-decode \
  --disable-accelerated-video-encode \
  --disable-logging \
  --log-level=3 \
  --v=-1 \
  "$@" 2>/dev/null
EOF
  chmod 755 /opt/Glint/glint
fi

# Ensure /usr/bin/glint links to /opt/Glint/glint wrapper
if type update-alternatives >/dev/null 2>&1; then
  if [ -L '/usr/bin/glint' -a -e '/usr/bin/glint' -a "`readlink '/usr/bin/glint'`" != '/etc/alternatives/glint' ]; then
    rm -f '/usr/bin/glint'
  fi
  update-alternatives --install '/usr/bin/glint' 'glint' '/opt/Glint/glint' 100 || ln -sf '/opt/Glint/glint' '/usr/bin/glint'
else
  ln -sf '/opt/Glint/glint' '/usr/bin/glint'
fi

# Update desktop and mime caches
if hash update-desktop-database 2>/dev/null; then
  update-desktop-database -q /usr/share/applications 2>/dev/null || true
fi
if hash update-mime-database 2>/dev/null; then
  update-mime-database /usr/share/mime 2>/dev/null || true
fi
