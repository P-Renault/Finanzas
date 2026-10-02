from pathlib import Path
import re, shutil, sys
TARGET=Path('CCF-MOBILE-B4.3.js'); BACKUP=TARGET.with_suffix('.js.bak')
if not TARGET.exists(): sys.exit('ERROR: no se encontró CCF-MOBILE-B4.3.js')
s=TARGET.read_text(encoding='utf-8')
start_marker='/* ================================================================\n   B4.3.10 — NUEVA VISTA CALENDARIO MÓVIL BOOTSTRAP'
start=s.find(start_marker)
if start<0: sys.exit('ERROR: no se encontró el bloque B4.3.10')
end=s.find('\n})();',start)
if end<0: sys.exit('ERROR: no se encontró el cierre del bloque B4.3.10')
end+=len('\n})();')
new=s[:start]+s[end:]
new,n=re.subn(r'\s*setTimeout\(activateBootstrapCalendarView,\s*120\);\s*','\n',new,count=1)
if n!=1: sys.exit(f'ERROR: activación esperada 1, encontrada {n}')
for token in ('activateBootstrapCalendarView','renderBootstrapCalendarView','ensureBootstrapCalendarView','ccf-bs-calendar-view'):
    if token in new: sys.exit('ERROR: quedó referencia '+token)
if 'adaptB232261CalendarMobile' not in new: sys.exit('ERROR: se eliminó la adaptación B232.26.4')
shutil.copy2(TARGET,BACKUP); TARGET.write_text(new,encoding='utf-8')
print('OK')
