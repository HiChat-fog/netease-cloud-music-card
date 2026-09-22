require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const { user_record, song_detail, user_account, user_subcount, user_playlist } = require('NeteaseCloudMusicApi');
const axios = require('axios').default;

async function getBase64(url) {
    let lastErr;
    for (let i = 0; i < 3; i++) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
            return Buffer.from(response.data, 'binary').toString('base64');
        } catch (e) {
            lastErr = e;
            console.log(`下载失败(第 ${i + 1} 次):${url}`);
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        }
    }
    throw lastErr;
}

const {
    USER_ID,
    USER_TOKEN,
    GH_TOKEN,
    AUTHOR,
    REPO,
} = process.env;

(async () => {
    const account = await user_account({
        cookie: `MUSIC_U=${USER_TOKEN}`,
    })
    const username = account.body.profile.nickname;
    const avatarUrl = account.body.profile.avatarUrl + "?param=128y128"; // 压缩
    console.log(`用户名：${username}\n \n个人头像: ${avatarUrl}\n`);

    /*
      获取歌单记录
    */
   
    const record = await user_record({
        cookie: `MUSIC_U=${USER_TOKEN}`,
        uid: USER_ID,
        type: 1
    }).catch(error => console.error(`无法获取用户播放记录 \n ${JSON.stringify(error)}`));
    
    const content = record.body;
    const songId = content.weekData[0].song.id + '';
    const songLink = "https://music.163.com/#/song?id=" + songId
    const songName = content.weekData[0].song.name.replace("&", "&amp;");
    const songAuthorArray = content.weekData[0].song.ar;
    const playCount = content.weekData[0].playCount;

    const songAuthors = songAuthorArray.map(i => i.name).join(' / ');

    const songDetail = await song_detail({
        cookie: `MUSIC_U=${USER_TOKEN}`,
        ids: songId,
    }).catch(error => console.error(`无法获取歌曲信息 \n${error}`));

    const songCover = songDetail.body.songs[0].al.picUrl + "?param=300y300";

    console.log(`歌曲名：${songName}\n歌曲链接：${songLink}\n歌曲作者：${songAuthors}\n歌曲封面：${songCover}\n播放次数：${playCount}`);

    var svgContent = "";
    try {

        const svgLink = `<svg width="310" height="490" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <a href="${songLink}">
         <foreignObject width="310" height="490">
             <div xmlns="http://www.w3.org/1999/xhtml" class="container" style="padding: 5px;">
             <style>
                 * {
                     box-sizing: border-box;
                     color:black;
                     font-size: 0;
                     font-family: 'PingFang SC', 'Helvetica Neue', 'Segoe UI', 'Microsoft YaHei', sans-serif !important;
                 }
     
                 html, body {
                     margin: 0;
                     padding: 3px;
                 }
     
                 p {
                     margin: 0;
                     padding: 0;
                 }
     
                 img {
                     margin: 0;
                     padding: 0;
                 }
     
                 .clear {
                     clear: both;
                 }
     
                 .card {
                     display: inline-block;
                     background: white;
                     border-radius: 10px;
                     text-align: center;
                     box-shadow: gray 0 0 10px;
                     overflow: hidden;
                 }
     
                 .user {
                     text-align: left;
                     margin: 10px;
                 }
     
                 .avatar {
                     width: 32px;
                     height: 32px;
                     border-radius: 100%;
                     vertical-align: middle;
                 }
     
                 .username {
                     line-height: 32px;
                     vertical-align: middle;
                     font-size: 16px;
                     margin-left: 5px;
                 }
     
                 .button {
                     background: #28C131;
                     width: 16px;
                     height: 16px;
                     border-radius: 100%;
                     vertical-align: middle;
                     float: right;
                     margin-top: 8px;
                     margin-right: 3px;
                 }
     
                 .hello {
                     margin: 10px;
                     margin-top: 5px;
                 }
     
                 .neteasecloud {
                     width: 28px;
                     height: 28px;
                     vertical-align: middle;
                 }
     
                 .intro {
                     vertical-align: middle;
                     color: #BA0400;
                     font-size: 16px;
                     margin-left: 10px;
                 }
     
                 .song {
                     margin: 0 auto;
                     width: 260px;
                     font-size: 20px;
                     margin-top: 10px;
                     overflow: hidden;
                     white-space: nowrap;
                     text-overflow: ellipsis;
                 }
     
                 .singer {
                     margin: 0 auto;
                     width: 260px;
                     margin-top: 5px;
                     overflow: hidden;
                     white-space: nowrap;
                     text-overflow: ellipsis;
                     opacity: 0.5;
                     font-size: 16px;
                 }
     
                 .cover {
                     width: 300px;
                     height: 300px;
                 }
     
                 .bars {
                     position: relative;
                     margin-top: 3px;
                     height: 30px;
                 }
     
                 .bar {
                     background: red;
                     bottom: 0;
                     height: 3px;
                     position: absolute;
                     width: 3px;
                     animation: sound 0ms -1000ms linear infinite alternate;
                 }
     
                 @keyframes sound {
                     0% {
                         opacity: .35;
                         height: 3px;
                     }
                     100% {
                         opacity: 1;
                         height: 20px;
                     }
                 }
     
                 .bar:nth-child(1)  { left: 1px; animation-duration: 412ms; }.bar:nth-child(2)  { left: 5px; animation-duration: 413ms; }.bar:nth-child(3)  { left: 9px; animation-duration: 466ms; }.bar:nth-child(4)  { left: 13px; animation-duration: 452ms; }.bar:nth-child(5)  { left: 17px; animation-duration: 423ms; }.bar:nth-child(6)  { left: 21px; animation-duration: 486ms; }.bar:nth-child(7)  { left: 25px; animation-duration: 416ms; }.bar:nth-child(8)  { left: 29px; animation-duration: 380ms; }.bar:nth-child(9)  { left: 33px; animation-duration: 405ms; }.bar:nth-child(10)  { left: 37px; animation-duration: 447ms; }.bar:nth-child(11)  { left: 41px; animation-duration: 409ms; }.bar:nth-child(12)  { left: 45px; animation-duration: 490ms; }.bar:nth-child(13)  { left: 49px; animation-duration: 392ms; }.bar:nth-child(14)  { left: 53px; animation-duration: 481ms; }.bar:nth-child(15)  { left: 57px; animation-duration: 373ms; }.bar:nth-child(16)  { left: 61px; animation-duration: 444ms; }.bar:nth-child(17)  { left: 65px; animation-duration: 397ms; }.bar:nth-child(18)  { left: 69px; animation-duration: 464ms; }.bar:nth-child(19)  { left: 73px; animation-duration: 396ms; }.bar:nth-child(20)  { left: 77px; animation-duration: 397ms; }.bar:nth-child(21)  { left: 81px; animation-duration: 370ms; }.bar:nth-child(22)  { left: 85px; animation-duration: 486ms; }.bar:nth-child(23)  { left: 89px; animation-duration: 484ms; }.bar:nth-child(24)  { left: 93px; animation-duration: 430ms; }.bar:nth-child(25)  { left: 97px; animation-duration: 402ms; }.bar:nth-child(26)  { left: 101px; animation-duration: 479ms; }.bar:nth-child(27)  { left: 105px; animation-duration: 417ms; }.bar:nth-child(28)  { left: 109px; animation-duration: 391ms; }.bar:nth-child(29)  { left: 113px; animation-duration: 433ms; }.bar:nth-child(30)  { left: 117px; animation-duration: 369ms; }.bar:nth-child(31)  { left: 121px; animation-duration: 439ms; }.bar:nth-child(32)  { left: 125px; animation-duration: 387ms; }.bar:nth-child(33)  { left: 129px; animation-duration: 423ms; }.bar:nth-child(34)  { left: 133px; animation-duration: 462ms; }.bar:nth-child(35)  { left: 137px; animation-duration: 435ms; }.bar:nth-child(36)  { left: 141px; animation-duration: 480ms; }.bar:nth-child(37)  { left: 145px; animation-duration: 429ms; }.bar:nth-child(38)  { left: 149px; animation-duration: 467ms; }.bar:nth-child(39)  { left: 153px; animation-duration: 429ms; }.bar:nth-child(40)  { left: 157px; animation-duration: 469ms; }.bar:nth-child(41)  { left: 161px; animation-duration: 372ms; }.bar:nth-child(42)  { left: 165px; animation-duration: 481ms; }.bar:nth-child(43)  { left: 169px; animation-duration: 408ms; }.bar:nth-child(44)  { left: 173px; animation-duration: 457ms; }.bar:nth-child(45)  { left: 177px; animation-duration: 465ms; }.bar:nth-child(46)  { left: 181px; animation-duration: 353ms; }.bar:nth-child(47)  { left: 185px; animation-duration: 430ms; }.bar:nth-child(48)  { left: 189px; animation-duration: 401ms; }.bar:nth-child(49)  { left: 193px; animation-duration: 356ms; }.bar:nth-child(50)  { left: 197px; animation-duration: 383ms; }.bar:nth-child(51)  { left: 201px; animation-duration: 491ms; }.bar:nth-child(52)  { left: 205px; animation-duration: 476ms; }.bar:nth-child(53)  { left: 209px; animation-duration: 396ms; }.bar:nth-child(54)  { left: 213px; animation-duration: 373ms; }.bar:nth-child(55)  { left: 217px; animation-duration: 362ms; }.bar:nth-child(56)  { left: 221px; animation-duration: 409ms; }.bar:nth-child(57)  { left: 225px; animation-duration: 375ms; }.bar:nth-child(58)  { left: 229px; animation-duration: 427ms; }.bar:nth-child(59)  { left: 233px; animation-duration: 368ms; }.bar:nth-child(60)  { left: 237px; animation-duration: 412ms; }.bar:nth-child(61)  { left: 241px; animation-duration: 381ms; }.bar:nth-child(62)  { left: 245px; animation-duration: 478ms; }.bar:nth-child(63)  { left: 249px; animation-duration: 449ms; }.bar:nth-child(64)  { left: 253px; animation-duration: 426ms; }.bar:nth-child(65)  { left: 257px; animation-duration: 481ms; }.bar:nth-child(66)  { left: 261px; animation-duration: 363ms; }.bar:nth-child(67)  { left: 265px; animation-duration: 365ms; }.bar:nth-child(68)  { left: 269px; animation-duration: 467ms; }.bar:nth-child(69)  { left: 273px; animation-duration: 424ms; }.bar:nth-child(70)  { left: 277px; animation-duration: 432ms; }.bar:nth-child(71)  { left: 281px; animation-duration: 464ms; }.bar:nth-child(72)  { left: 285px; animation-duration: 453ms; }.bar:nth-child(73)  { left: 289px; animation-duration: 427ms; }.bar:nth-child(74)  { left: 293px; animation-duration: 452ms; }.bar:nth-child(75)  { left: 297px; animation-duration: 447ms; }
         
             </style>
                 <div class="card">
                     <div class="user">
                         <img class="avatar" src="data:image/jpg;base64,${await getBase64(avatarUrl)}"/>
                         <a class="username">${username}</a>
                         <a class="button"></a>
                         <div class="clear"></div>
                     </div>
                     <div class="hello">
                         <img class="neteasecloud" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABoVBMVEUAAADdABvdABvdABvdABvdABvdABvdABvdABvdABvdABvdABvdABvdABvdABvdABvdABviJz7pXW7nS17eBiDugo/////62t7hHDTgEyzufYvdARzlOk/50tf+9vfteojpWGr97vDgGTH3xszjKkHviZXteIb86OrrbHzra3v509jqX3D0rbbfDijiIjnwkp7ynqjqYnP98vPzpa/wjpr++vv87O7pWmv74OPeCiT0q7T3w8n3wsj97/HraXndAx786uzrZ3foU2X++/vpV2nnSVz85+rfECn0rrf//PzjMEbjLEL2u8LeCSP+9/jjL0X4ytD1tb3nTF/74uXkNkv3wMfmRFj//f3pW2z619v86evlO1D0r7fscH/+9PXmRVnnSFv98PL1sbn0qbLgFS786+363eHoVmjhGzPkOE35z9Tyn6n85un62Nz97e/nSl350dbqXm/73+LraHjjK0Hufoz4yc/eBR/51dnnTWDjLUP98fLeCyXwkJz4yM7tdYTlOU7oUmT0qrP1srrranrkM0n4ztP+9fb75Of1tLzfDCZ1sXtGAAAAEHRSTlMAE2Ok0vMup/oNl/4r2zjxygE/KQAAAAFiS0dEFnzRqBkAAAAHdElNRQflCQ0QCDMeCNJTAAABwElEQVQ4y41T9VtCUQx9lAiiTsWjiIndhdiN3d2Kjd3dHX+1F+59DzA+PD9s+9727razTZIUqNQarY5Ip9WoVdJPhOhDSUGoPuSb22AMowCEGQ3+flM4/UC4yeePiKRfEBmh/B/oj4qOMfMI8YYh8P1YAHHxPAuvwyi7LAkJVkoEkpKRwr8Yvf3J9aemATZKQTplZNpEL55u9cKfBWTnEOUizy+fnvEn+MkHCgqJioqBktJChTGVpOaWrQzlVjLbK+CBo1KOUEsabthRVU1UA9TWwVEPNIgAjaT16sYmNBO1oNVJbWjv6ERXNw/QSjqv7gEsRL3IJOrrx4B5EEM8QCdxPYwRJh0YZXIMpTSOCQv3iIBJTDE5jRkmZzFHjfNYEAE8hQuLTC5hmWhlFS6iNayLFLxIN8Cq2pjA5tY2dtisdrEnihRt7qOYyYN+RsJhD1E34BZtCqKOUHHs4SvnxNnHdAFOZaIE1WfnWHMrI8gFLmSq5WFdXqG9jZvXN8CWMixl3Bts2rd3rvuHGwfwaPaNW1mY+CcILD5b/RbGb+Ve7K9pb+8fR5/yYht+XVrfWpv+u/bBDyf46QU/3r/P/wt/IFj7qdvKMgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMS0wOS0xM1QxNjowODo1MSswMDowMKszm9EAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjEtMDktMTNUMTY6MDg6NTErMDA6MDDabiNtAAAAAElFTkSuQmCC" />
                         <a class="intro">这周听了多达 ${playCount} 次</a>
                     </div>
                     <p class="song">${songName}</p>
                     <p class="singer">${songAuthors}</p>
                     <div class="bars">
                         <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                     </div>
                     <img class="cover" src="data:image/jpg;base64,${await getBase64(songCover)}" />
                 </div>
             </div>
         </foreignObject>
        </a>
     </svg>
     `
        ;     
        // console.log(`svgLink : ${svgLink}`)
        svgContent = Buffer.from(svgLink).toString('base64');
        // svgContent = btoa(btoa(unescape(encodeURIComponent(svgLink))));
    } catch(err) {
        console.error(`处理 SVG 时发生了错误：${err}`);
    }

    /* ---------- 生成“正在单曲循环”小卡片（README 顶部） ---------- */
    const escapeXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const trunc = (s, maxEm) => {
        let w = 0, out = '';
        for (const ch of s) {
            w += /[\u1100-\uFFFD\u3000-\u303F]/.test(ch) ? 1 : 0.55;
            if (w > maxEm) return out + '…';
            out += ch;
        }
        return out;
    };
    let nowCards = null;
    let nowMeta = null;
    let topAlbums = null;
    try {
        const top = content.weekData[0];
        const nowName = escapeXml(trunc(String(top.song.name), 15));
        const nowArtist = escapeXml(trunc(top.song.ar.map(i => i.name).join(' / '), 17));
        const nowCount = top.playCount;
        const nowId = top.song.id + '';
        const nowDetail = await song_detail({
            cookie: `MUSIC_U=${USER_TOKEN}`,
            ids: nowId,
        });
        const nowCoverB64 = await getBase64(nowDetail.body.songs[0].al.picUrl + "?param=120y120");
        const updatedAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(5, 16).replace('T', ' ');
        nowMeta = JSON.stringify({
            id: Number(nowId),
            name: String(top.song.name),
            artist: top.song.ar.map(i => i.name).join(' / '),
            updatedAt: updatedAt,
        });
        const themes = {
            dark:  { bg: "#0D1117", border: "#21283B", text: "#C9D1D9", muted: "#8B949E", hole: "#0D1117", accent: "#C79FD4" },
            light: { bg: "#FFFFFF", border: "#D0D7DE", text: "#24292F", muted: "#57606A", hole: "#FFFFFF", accent: "#B385BE" },
        };
        const FONT = "'PingFang SC','Microsoft YaHei','Segoe UI',Helvetica,Arial,sans-serif";
        const eqBars = (accent) => {
            const base = 82, x0 = 402, seqs = [[8, 24, 12, 26, 8], [12, 18, 26, 10, 12], [6, 14, 22, 16, 6]];
            let out = '';
            for (let i = 0; i < 5; i++) {
                const vals = seqs[i % 3];
                const dur = (0.8 + i * 0.14).toFixed(2);
                out += `<rect x="${x0 + i * 9}" y="${base - 12}" width="6" height="12" rx="2" fill="${accent}">`
                    + `<animate attributeName="height" values="${vals.join(';')}" dur="${dur}s" repeatCount="indefinite"/>`
                    + `<animate attributeName="y" values="${vals.map(v => base - v).join(';')}" dur="${dur}s" repeatCount="indefinite"/></rect>`;
            }
            return out;
        };
        nowCards = {};
        for (const [variant, t] of Object.entries(themes)) {
            nowCards[variant] = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="470" height="110" viewBox="0 0 470 110" role="img">
  <rect x="0.75" y="0.75" width="468.5" height="108.5" rx="14" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 62 55" to="360 62 55" dur="9s" repeatCount="indefinite"/>
    <circle cx="62" cy="55" r="42" fill="#141419"/>
    <circle cx="62" cy="55" r="42" fill="none" stroke="${t.border}" stroke-width="1"/>
    <circle cx="62" cy="55" r="33" fill="${t.hole}"/>
    <clipPath id="nowClip${variant}"><circle cx="62" cy="55" r="31"/></clipPath>
    <image href="data:image/jpeg;base64,${nowCoverB64}" xlink:href="data:image/jpeg;base64,${nowCoverB64}" x="31" y="24" width="62" height="62" clip-path="url(#nowClip${variant})" preserveAspectRatio="xMidYMid slice"/>
    <circle cx="62" cy="55" r="5" fill="${t.hole}" stroke="#141419" stroke-width="2"/>
    <path d="M26 42 A40 40 0 0 1 42 24" stroke="${t.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.65"/>
  </g>
  ${eqBars(t.accent)}
  <path d="M212 31 a8 8 0 0 1 16 0" stroke="${t.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <rect x="210" y="30" width="4.5" height="7" rx="2" fill="${t.accent}"/>
  <rect x="225.5" y="30" width="4.5" height="7" rx="2" fill="${t.accent}"/>
  <text x="238" y="38" font-family="${FONT}" font-size="12.5" font-weight="700" fill="${t.accent}">正在单曲循环</text>
  <text x="152" y="60" font-family="${FONT}" font-size="16.5" font-weight="700" fill="${t.text}">${nowName}</text>
  <text x="152" y="79" font-family="${FONT}" font-size="12.5" fill="${t.muted}">${nowArtist}</text>
  <text x="152" y="97" font-family="${FONT}" font-size="10.5" fill="${t.muted}" opacity="0.85">本周播放 ${nowCount} 次 · 更新于 ${updatedAt}</text>
</svg>`;
        }
        console.log(`正在听卡片生成成功：${nowName} / ${nowArtist}（本周 ${nowCount} 次）`);
    } catch (err) {
        console.error(`生成正在听卡片时发生了错误：${err}`);
    }

    /* ---------- 聚合本周最常听专辑（艺人名含中文视为华语，按需排除） ---------- */
    const NON_CN_BLOCKLIST = new Set(['twins']); // 英文名的华语艺人,遇到就往这里加
    try {
        const ids = content.weekData.map(w => w.song.id).join(',');
        const details = await song_detail({ cookie: `MUSIC_U=${USER_TOKEN}`, ids: ids });
        const albumMap = new Map();
        for (const w of content.weekData) {
            const d = details.body.songs.find(s => s.id === w.song.id);
            if (!d || !d.al) continue;
            const artists = (d.ar || []).map(a => a.name).join(' / ');
            if (/[\u4e00-\u9fff]/.test(artists) || NON_CN_BLOCKLIST.has(artists.toLowerCase())) continue;
            const al = d.al;
            if (!albumMap.has(al.id)) {
                albumMap.set(al.id, { id: al.id, name: al.name, artist: artists, pic: al.picUrl + '?param=300y300', count: 0 });
            }
            albumMap.get(al.id).count += w.playCount;
        }
        topAlbums = JSON.stringify([...albumMap.values()].sort((a, b) => b.count - a.count).slice(0, 8));
        console.log(`专辑聚合完成：${albumMap.size} 张（排除华语后取前 8）`);
    } catch (err) {
        console.error(`聚合专辑时发生了错误：${err}`);
    }

    try {
        const octokit = new Octokit({
            auth: GH_TOKEN,
        });

        const {
            data: { sha: svgSha }
        } = await octokit.git.createBlob({
            owner: AUTHOR,
            repo: REPO,
            content: svgContent,
            encoding: "base64"
        });

        const treeEntries = [
            {
                mode: '100644',
                path: "music-card.svg",
                type: "blob",
                sha: svgSha
            }
        ];
        if (nowCards) {
            for (const [file, text] of [
                ["music-now-dark.svg", nowCards.dark],
                ["music-now-light.svg", nowCards.light],
            ]) {
                const {
                    data: { sha: nowSha }
                } = await octokit.git.createBlob({
                    owner: AUTHOR,
                    repo: REPO,
                    content: Buffer.from(text).toString('base64'),
                    encoding: "base64"
                });
                treeEntries.push({ mode: '100644', path: file, type: "blob", sha: nowSha });
            }
        }
        if (nowMeta) {
            const {
                data: { sha: metaSha }
            } = await octokit.git.createBlob({
                owner: AUTHOR,
                repo: REPO,
                content: Buffer.from(nowMeta).toString('base64'),
                encoding: "base64"
            });
            treeEntries.push({ mode: '100644', path: "now-playing.json", type: "blob", sha: metaSha });
        }
        if (topAlbums) {
            const {
                data: { sha: albumsSha }
            } = await octokit.git.createBlob({
                owner: AUTHOR,
                repo: REPO,
                content: Buffer.from(topAlbums).toString('base64'),
                encoding: "base64"
            });
            treeEntries.push({ mode: '100644', path: "top-albums.json", type: "blob", sha: albumsSha });
        }

        const commits = await octokit.repos.listCommits({
            owner: AUTHOR,
            repo: REPO,
        });
        const lastSha = commits.data[0].sha;
        const {
            data: { sha: treeSHA }
        } =  await octokit.git.createTree({
            owner: AUTHOR,
            repo: REPO,
            tree: treeEntries,
            base_tree: lastSha,
        });
        const {
            data: { sha: newSHA }
        } =  await octokit.git.createCommit({
            owner: AUTHOR,
            repo: REPO,
            author: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            committer: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            tree: treeSHA,
            message: 'Update SVG periodically',
            parents: [ lastSha ],
        });
        const result = await octokit.git.updateRef({
            owner: AUTHOR,
            repo: REPO,
            ref: "heads/main",
            sha: newSHA,
        });
        console.log(result);
    } catch(err) {
        console.error(`上传 SVG 时发生了错误：${err}`);
    }

})();

