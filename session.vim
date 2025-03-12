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
badd +9 src/app/api/projects/route.ts
badd +8 src/app/projects/page.tsx
badd +1 prisma/schema.prisma
badd +1 src/app/api/projects/\[id]/route.ts
badd +3 ~/code/caenar/src/app/admin/page.tsx
argglobal
%argdel
tabnew +setlocal\ bufhidden=wipe
tabnew +setlocal\ bufhidden=wipe
tabrewind
edit src/app/api/projects/\[id]/route.ts
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
balt src/app/api/projects/route.ts
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
9,10fold
9,11fold
8,12fold
14,17fold
13,17fold
4,18fold
28,30fold
28,31fold
33,34fold
24,37fold
39,42fold
38,42fold
20,43fold
50,52fold
54,57fold
53,57fold
46,58fold
let &fdl = &fdl
20
normal! zo
24
normal! zo
let s:l = 1 - ((0 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("src/app/api/projects/route.ts", ":p")) | buffer src/app/api/projects/route.ts | else | edit src/app/api/projects/route.ts | endif
if &buftype ==# 'terminal'
  silent file src/app/api/projects/route.ts
endif
balt src/app/api/projects/\[id]/route.ts
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
8,9fold
12,14fold
12,15fold
5,17fold
19,22fold
18,22fold
4,23fold
31,32fold
31,33fold
27,35fold
37,40fold
36,40fold
26,41fold
let &fdl = &fdl
let s:l = 11 - ((10 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 11
normal! 0
wincmd w
exe 'vert 1resize ' . ((&columns * 96 + 96) / 193)
exe 'vert 2resize ' . ((&columns * 96 + 96) / 193)
tabnext
edit prisma/schema.prisma
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
1,2fold
5,8fold
11,17fold
20,24fold
27,33fold
let &fdl = &fdl
let s:l = 1 - ((0 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 015|
tabnext
edit ~/code/caenar/src/app/admin/page.tsx
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
exe 'vert 1resize ' . ((&columns * 99 + 96) / 193)
exe 'vert 2resize ' . ((&columns * 93 + 96) / 193)
argglobal
balt src/app/projects/page.tsx
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
9,10fold
13,16fold
21,23fold
24,25fold
20,26fold
19,29fold
19,30fold
38,39fold
38,40fold
37,41fold
34,42fold
33,43fold
32,43fold
54,55fold
52,57fold
52,58fold
51,59fold
50,60fold
61,63fold
50,64fold
49,65fold
47,66fold
46,67fold
6,67fold
let &fdl = &fdl
6
normal! zo
19
normal! zo
19
normal! zo
let s:l = 52 - ((34 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 52
normal! 017|
wincmd w
argglobal
if bufexists(fnamemodify("src/app/projects/page.tsx", ":p")) | buffer src/app/projects/page.tsx | else | edit src/app/projects/page.tsx | endif
if &buftype ==# 'terminal'
  silent file src/app/projects/page.tsx
endif
balt ~/code/caenar/src/app/admin/page.tsx
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
3,5fold
12,14fold
15,16fold
11,17fold
10,20fold
10,21fold
28,30fold
27,31fold
26,31fold
26,32fold
24,33fold
23,34fold
7,34fold
let &fdl = &fdl
let s:l = 7 - ((6 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 7
normal! 02|
wincmd w
exe 'vert 1resize ' . ((&columns * 99 + 96) / 193)
exe 'vert 2resize ' . ((&columns * 93 + 96) / 193)
tabnext 2
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
