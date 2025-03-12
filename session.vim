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
badd +15 src/app/styles/globals.css
badd +14 tailwind.config.ts
badd +39 src/app/page.tsx
badd +1 src/components/terminal.tsx
badd +5 src/utils/prisma.ts
badd +1 ~/code/caenar/src/app/api/projects/route.ts
badd +60 ~/code/caenar/src/hooks/useTerminal.tsx
argglobal
%argdel
tabnew +setlocal\ bufhidden=wipe
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
exe '1resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 1resize ' . ((&columns * 96 + 96) / 193)
exe '2resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 2resize ' . ((&columns * 96 + 96) / 193)
argglobal
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
18,53fold
57,60fold
61,63fold
56,64fold
71,72fold
69,75fold
68,76fold
67,76fold
66,78fold
65,79fold
55,80fold
17,81fold
16,82fold
15,82fold
let &fdl = &fdl
let s:l = 39 - ((14 * winheight(0) + 25) / 50)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 39
normal! 018|
wincmd w
argglobal
if bufexists(fnamemodify("src/components/terminal.tsx", ":p")) | buffer src/components/terminal.tsx | else | edit src/components/terminal.tsx | endif
if &buftype ==# 'terminal'
  silent file src/components/terminal.tsx
endif
balt src/app/page.tsx
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
15,16fold
37,39fold
37,41fold
35,42fold
33,44fold
32,45fold
32,46fold
20,51fold
52,59fold
60,65fold
19,66fold
70,72fold
69,73fold
69,74fold
78,79fold
85,95fold
98,100fold
96,102fold
84,103fold
83,105fold
82,106fold
109,119fold
126,131fold
120,134fold
108,135fold
77,136fold
76,137fold
6,137fold
let &fdl = &fdl
let s:l = 78 - ((25 * winheight(0) + 25) / 50)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 78
normal! 029|
wincmd w
exe '1resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 1resize ' . ((&columns * 96 + 96) / 193)
exe '2resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 2resize ' . ((&columns * 96 + 96) / 193)
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
exe '1resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 1resize ' . ((&columns * 96 + 96) / 193)
exe '2resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 2resize ' . ((&columns * 96 + 96) / 193)
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
let s:l = 15 - ((10 * winheight(0) + 25) / 50)
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
let s:l = 14 - ((9 * winheight(0) + 25) / 50)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 14
normal! 0
wincmd w
exe '1resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 1resize ' . ((&columns * 96 + 96) / 193)
exe '2resize ' . ((&lines * 51 + 27) / 54)
exe 'vert 2resize ' . ((&columns * 96 + 96) / 193)
tabnext
edit src/utils/prisma.ts
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
exe 'vert 1resize ' . ((&columns * 96 + 96) / 193)
exe 'vert 2resize ' . ((&columns * 96 + 96) / 193)
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
5,6fold
8,9fold
7,11fold
let &fdl = &fdl
let s:l = 7 - ((4 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 7
normal! 08|
wincmd w
argglobal
if bufexists(fnamemodify("~/code/caenar/src/app/api/projects/route.ts", ":p")) | buffer ~/code/caenar/src/app/api/projects/route.ts | else | edit ~/code/caenar/src/app/api/projects/route.ts | endif
if &buftype ==# 'terminal'
  silent file ~/code/caenar/src/app/api/projects/route.ts
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
1,2fold
5,7fold
9,12fold
8,12fold
4,13fold
21,22fold
21,23fold
17,25fold
27,30fold
26,30fold
16,31fold
let &fdl = &fdl
let s:l = 1 - ((0 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 0
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 96 + 96) / 193)
exe 'vert 2resize ' . ((&columns * 96 + 96) / 193)
tabnext 3
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
