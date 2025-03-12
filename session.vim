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
badd +6 src/app/api/projects/route.ts
badd +6 ~/code/caenar/src/lib/fetchData.ts
badd +51 src/components/projectCard.tsx
badd +28 ~/code/caenar/src/app/projects/page.tsx
argglobal
%argdel
edit ~/code/caenar/src/app/projects/page.tsx
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
exe 'vert 1resize ' . ((&columns * 94 + 96) / 193)
exe 'vert 2resize ' . ((&columns * 98 + 96) / 193)
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
let s:l = 17 - ((16 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 17
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("src/components/projectCard.tsx", ":p")) | buffer src/components/projectCard.tsx | else | edit src/components/projectCard.tsx | endif
if &buftype ==# 'terminal'
  silent file src/components/projectCard.tsx
endif
balt ~/code/caenar/src/lib/fetchData.ts
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
18,22fold
18,23fold
34,38fold
31,39fold
29,42fold
28,43fold
45,48fold
56,58fold
54,59fold
53,60fold
52,60fold
52,61fold
50,62fold
44,63fold
27,64fold
26,65fold
25,66fold
15,66fold
let &fdl = &fdl
let s:l = 51 - ((35 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 51
normal! 020|
wincmd w
exe 'vert 1resize ' . ((&columns * 94 + 96) / 193)
exe 'vert 2resize ' . ((&columns * 98 + 96) / 193)
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
