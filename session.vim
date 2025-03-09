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
badd +47 src/components/terminal.tsx
badd +66 src/hooks/useTerminal.tsx
badd +17 src/app/styles/globals.css
badd +7 tailwind.config.ts
badd +51 src/app/page.tsx
argglobal
%argdel
tabnew +setlocal\ bufhidden=wipe
tabnew +setlocal\ bufhidden=wipe
tabrewind
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
34,35fold
39,42fold
37,44fold
36,44fold
33,45fold
47,50fold
47,52fold
46,52fold
17,56fold
16,58fold
69,75fold
78,80fold
76,82fold
68,83fold
67,85fold
66,86fold
89,99fold
106,113fold
100,115fold
88,116fold
62,117fold
61,118fold
6,118fold
let &fdl = &fdl
6
normal! zo
16
normal! zo
17
normal! zo
46
normal! zo
47
normal! zo
61
normal! zo
62
normal! zo
66
normal! zo
67
normal! zo
68
normal! zo
76
normal! zo
let s:l = 14 - ((12 * winheight(0) + 33) / 66)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 14
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
49
normal! zo
50
normal! zo
51
normal! zo
let s:l = 58 - ((29 * winheight(0) + 33) / 66)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 58
normal! 031|
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 126 + 126) / 253)
exe 'vert 2resize ' . ((&columns * 126 + 126) / 253)
tabnext
edit src/app/page.tsx
argglobal
balt src/hooks/useTerminal.tsx
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal nofen
silent! normal! zE
4,7fold
3,10fold
18,22fold
23,27fold
17,28fold
30,32fold
34,36fold
38,39fold
37,42fold
43,45fold
33,46fold
29,47fold
16,48fold
15,50fold
14,53fold
13,53fold
12,53fold
let &fdl = &fdl
3
normal! zo
4
normal! zo
12
normal! zo
13
normal! zo
14
normal! zo
15
normal! zo
16
normal! zo
17
normal! zo
18
normal! zo
23
normal! zo
29
normal! zo
30
normal! zo
33
normal! zo
34
normal! zo
37
normal! zo
38
normal! zo
43
normal! zo
let s:l = 49 - ((47 * winheight(0) + 33) / 66)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 49
normal! 016|
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
let s:l = 17 - ((16 * winheight(0) + 33) / 66)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 17
normal! 017|
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
let s:l = 8 - ((7 * winheight(0) + 33) / 66)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 8
normal! 020|
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
