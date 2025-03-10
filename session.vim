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
badd +17 src/app/styles/globals.css
badd +1 tailwind.config.ts
badd +18 src/app/page.tsx
badd +26 src/components/projectCard.tsx
argglobal
%argdel
tabnew +setlocal\ bufhidden=wipe
tabrewind
edit src/app/page.tsx
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
exe 'vert 1resize ' . ((&columns * 118 + 118) / 237)
exe 'vert 2resize ' . ((&columns * 118 + 118) / 237)
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
4,8fold
3,13fold
21,25fold
26,30fold
20,31fold
33,35fold
37,39fold
41,42fold
40,45fold
46,48fold
36,49fold
32,50fold
19,51fold
18,52fold
54,56fold
60,63fold
64,66fold
59,67fold
74,75fold
72,78fold
71,79fold
70,79fold
69,81fold
68,82fold
58,83fold
17,84fold
16,85fold
15,85fold
let &fdl = &fdl
let s:l = 65 - ((31 * winheight(0) + 31) / 63)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 65
normal! 055|
wincmd w
argglobal
if bufexists(fnamemodify("src/components/projectCard.tsx", ":p")) | buffer src/components/projectCard.tsx | else | edit src/components/projectCard.tsx | endif
if &buftype ==# 'terminal'
  silent file src/components/projectCard.tsx
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
3,7fold
9,12fold
18,23fold
18,24fold
35,39fold
32,40fold
30,43fold
29,44fold
46,49fold
56,58fold
54,59fold
53,60fold
52,60fold
52,61fold
51,62fold
45,63fold
28,64fold
27,65fold
26,66fold
15,66fold
let &fdl = &fdl
let s:l = 26 - ((10 * winheight(0) + 31) / 63)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 26
normal! 07|
wincmd w
exe 'vert 1resize ' . ((&columns * 118 + 118) / 237)
exe 'vert 2resize ' . ((&columns * 118 + 118) / 237)
tabnext
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
exe 'vert 1resize ' . ((&columns * 118 + 118) / 237)
exe 'vert 2resize ' . ((&columns * 118 + 118) / 237)
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
16,17fold
20,21fold
24,25fold
28,29fold
32,33fold
36,37fold
40,41fold
44,45fold
48,49fold
54,55fold
58,59fold
62,63fold
66,67fold
70,72fold
75,77fold
80,81fold
84,85fold
88,89fold
let &fdl = &fdl
let s:l = 15 - ((14 * winheight(0) + 31) / 63)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 15
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("tailwind.config.ts", ":p")) | buffer tailwind.config.ts | else | edit tailwind.config.ts | endif
if &buftype ==# 'terminal'
  silent file tailwind.config.ts
endif
balt src/app/styles/globals.css
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
let s:l = 14 - ((13 * winheight(0) + 31) / 63)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 14
normal! 0
wincmd w
exe 'vert 1resize ' . ((&columns * 118 + 118) / 237)
exe 'vert 2resize ' . ((&columns * 118 + 118) / 237)
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
