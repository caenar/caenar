let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/code/caenar
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +90 src/components/terminal.tsx
badd +71 src/hooks/useTerminal.tsx
badd +11 src/app/styles/globals.css
badd +7 tailwind.config.ts
argglobal
%argdel
tabnew +setlocal\ bufhidden=wipe
tabrewind
edit src/app/styles/globals.css
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 126 + 126) / 253)
exe 'vert 2resize ' . ((&columns * 126 + 126) / 253)
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
5,9fold
12,13fold
16,18fold
21,22fold
25,26fold
29,30fold
33,34fold
37,38fold
41,42fold
45,46fold
49,50fold
55,56fold
59,60fold
63,64fold
67,68fold
71,73fold
76,78fold
81,82fold
let &fdl = &fdl
let s:l = 11 - ((10 * winheight(0) + 32) / 65)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 11
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("tailwind.config.ts", ":p")) | buffer tailwind.config.ts | else | edit tailwind.config.ts | endif
if &buftype ==# 'terminal'
  silent file tailwind.config.ts
endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
4,9fold
12,30fold
32,34fold
11,35fold
10,36fold
3,38fold
let &fdl = &fdl
let s:l = 8 - ((7 * winheight(0) + 32) / 65)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 8
normal! 020|
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 126 + 126) / 253)
exe 'vert 2resize ' . ((&columns * 126 + 126) / 253)
tabnext
edit src/components/terminal.tsx
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 126 + 126) / 253)
exe 'vert 2resize ' . ((&columns * 126 + 126) / 253)
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
3,4fold
12,13fold
32,33fold
37,40fold
35,42fold
34,42fold
31,43fold
47,50fold
45,52fold
44,52fold
17,56fold
16,57fold
68,78fold
81,83fold
79,85fold
67,86fold
66,88fold
65,89fold
92,102fold
109,116fold
103,118fold
91,119fold
61,120fold
60,121fold
6,121fold
let &fdl = &fdl
let s:l = 90 - ((32 * winheight(0) + 32) / 65)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 90
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("src/hooks/useTerminal.tsx", ":p")) | buffer src/hooks/useTerminal.tsx | else | edit src/hooks/useTerminal.tsx | endif
if &buftype ==# 'terminal'
  silent file src/hooks/useTerminal.tsx
endif
balt src/components/terminal.tsx
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
6,17fold
5,18fold
4,18fold
21,28fold
20,29fold
19,29fold
30,31fold
34,40fold
33,41fold
32,41fold
3,42fold
45,46fold
53,58fold
51,58fold
50,62fold
68,70fold
75,77fold
74,79fold
73,80fold
71,82fold
67,83fold
66,84fold
65,85fold
64,86fold
49,86fold
89,92fold
let &fdl = &fdl
let s:l = 71 - ((40 * winheight(0) + 32) / 65)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 71
normal! 016|
wincmd w
exe 'vert 1resize ' . ((&columns * 126 + 126) / 253)
exe 'vert 2resize ' . ((&columns * 126 + 126) / 253)
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
