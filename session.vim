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
badd +23 src/app/contact/page.tsx
badd +161 src/app/about/page.tsx
badd +0 src/app/styles/globals.css
argglobal
%argdel
edit src/app/about/page.tsx
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
exe 'vert 1resize ' . ((&columns * 96 + 97) / 194)
exe 'vert 2resize ' . ((&columns * 97 + 97) / 194)
argglobal
balt src/app/contact/page.tsx
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
10,14fold
27,28fold
26,29fold
33,34fold
32,35fold
46,50fold
43,51fold
40,53fold
39,53fold
39,54fold
62,66fold
59,67fold
56,69fold
77,81fold
74,82fold
71,84fold
86,99fold
108,112fold
105,114fold
102,116fold
101,116fold
101,117fold
38,119fold
38,120fold
128,131fold
132,138fold
127,139fold
142,147fold
140,149fold
126,150fold
124,151fold
154,155fold
160,165fold
158,168fold
157,168fold
157,169fold
170,177fold
153,178fold
182,183fold
187,190fold
192,198fold
199,201fold
192,202fold
191,203fold
186,204fold
181,205fold
208,209fold
215,218fold
213,219fold
212,220fold
207,221fold
180,222fold
123,223fold
122,224fold
16,224fold
let &fdl = &fdl
let s:l = 161 - ((19 * winheight(0) + 21) / 42)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 161
normal! 037|
wincmd w
argglobal
if bufexists(fnamemodify("src/app/styles/globals.css", ":p")) | buffer src/app/styles/globals.css | else | edit src/app/styles/globals.css | endif
if &buftype ==# 'terminal'
  silent file src/app/styles/globals.css
endif
balt src/app/about/page.tsx
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
50,51fold
54,55fold
58,59fold
62,63fold
66,68fold
71,73fold
76,77fold
80,81fold
84,85fold
88,89fold
92,93fold
97,98fold
101,102fold
105,106fold
let &fdl = &fdl
let s:l = 93 - ((32 * winheight(0) + 21) / 42)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 93
normal! 029|
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 96 + 97) / 194)
exe 'vert 2resize ' . ((&columns * 97 + 97) / 194)
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
