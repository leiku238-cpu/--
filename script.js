// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
  // ========== 核心元素获取 ==========
  const homePage = document.getElementById('homePage');
  const searchPage = document.getElementById('searchPage');
  const playlistDetailPage = document.getElementById('playlistDetailPage');
  const playerDetailPage = document.getElementById('playerDetailPage');
  const searchInput = document.getElementById('searchInput');
  const backBtn = document.getElementById('backBtn'); // 歌单详情页返回键
  const playerBackBtn = document.createElement('button'); // 播放详情页返回键

  // 初始化播放详情页返回键
  playerBackBtn.id = 'playerBackBtn';
  playerBackBtn.innerHTML = '← 返回';
  playerBackBtn.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.5);
        color: #fff;
        border: none;
        border-radius: 20px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
        z-index: 9999;
    `;
  playerDetailPage.prepend(playerBackBtn);

  // 播放详情页元素
  const vinylRecord = document.getElementById('vinylRecord');
  const tonearm = document.getElementById('tonearm');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const progressBarDetail = document.getElementById('progressBarDetail');
  const progressCurrentDetail = document.getElementById('progressCurrentDetail');
  const progressHandleDetail = document.getElementById('progressHandleDetail');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const lyricsContent = document.getElementById('lyricsContent');
  const lyricsContainer = document.getElementById('lyricsContainer');

  // ========== 模拟数据 ==========
  // 歌单数据
  const playlistData = {
    1: {
      cover: "https://picsum.photos/300/300?random=1",
      playCount: "129.4万",
      title: "华语叙事 | 每首歌都是一个故事",
      desc: "[Spotify热门曲目]高赞评论破10万的单曲精选 感谢各位朋友",
      creator: "今天咱也要好好听歌",
      tags: ["华语", "流行", "90后"],
      createTime: "2025-05-09创建",
      addCount: 2587,
      songCount: 154,
      songs: [
        { id: 1, title: "我记得", artist: "赵雷", album: "署前街少年", duration: "05:29", cover: "https://picsum.photos/32/32?random=101" },
        { id: 2, title: "遗憾", artist: "屿川", album: "遗憾", duration: "03:12", cover: "https://picsum.photos/32/32?random=102" },
        { id: 3, title: "孤独患者", artist: "陈奕迅", album: "?", duration: "04:31", cover: "https://picsum.photos/32/32?random=103" },
        { id: 4, title: "答案", artist: "杨坤 / 郭采洁", album: "答案", duration: "03:51", cover: "https://picsum.photos/32/32?random=104" },
        { id: 5, title: "乌梅子酱", artist: "李荣浩", album: "纵横四海", duration: "04:17", cover: "https://picsum.photos/32/32?random=105" }
      ]
    },
    2: {
      cover: "https://picsum.photos/300/300?random=2",
      playCount: "4329.4万",
      title: "emo天花板歌曲系列「伤感」「睡觉」",
      desc: "深夜emo必备，听了想流泪的伤感歌曲合集",
      creator: "深夜の歌单",
      tags: ["伤感", "emo", "深夜"],
      createTime: "2025-03-15创建",
      addCount: 8976,
      songCount: 218,
      songs: [
        { id: 1, title: "小幸运", artist: "田馥甄", album: "我的少女时代", duration: "04:05", cover: "https://picsum.photos/32/32?random=201" },
        { id: 2, title: "后来", artist: "刘若英", album: "我等你", duration: "05:41", cover: "https://picsum.photos/32/32?random=202" },
        { id: 3, title: "成全", artist: "刘若英", album: "我的失败与伟大", duration: "04:20", cover: "https://picsum.photos/32/32?random=203" }
      ]
    },
    3: {
      cover: "https://picsum.photos/300/300?random=3",
      playCount: "11287.3万",
      title: "车载嗨曲 开车靠的是感觉 不是眼睛",
      desc: "开车必听的劲爆嗨曲，节奏感拉满",
      creator: "车载音乐库",
      tags: ["车载", "嗨曲", "节奏感"],
      createTime: "2025-01-20创建",
      addCount: 12580,
      songCount: 189,
      songs: [
        { id: 1, title: "野狼Disco", artist: "宝石Gem", album: "野狼Disco", duration: "03:45", cover: "https://picsum.photos/32/32?random=301" },
        { id: 2, title: "逆战", artist: "张杰", album: "逆战", duration: "03:37", cover: "https://picsum.photos/32/32?random=302" },
        { id: 3, title: "平凡之路", artist: "朴树", album: "猎户星座", duration: "05:01", cover: "https://picsum.photos/32/32?random=303" }
      ]
    }
  };

  // 我喜欢的音乐列表
  const likeSongs = [
    { id: 1, title: "左转灯 (1000 Times +1)", artist: "Joji", album: "Nectar", duration: "03:45", cover: "https://picsum.photos/32/32?random=401" },
    { id: 2, title: "海屿你", artist: "郑润泽", album: "海屿你", duration: "04:12", cover: "https://picsum.photos/32/32?random=402" },
    { id: 3, title: "一半一半", artist: "张星特", album: "一半一半", duration: "03:58", cover: "https://picsum.photos/32/32?random=403" }
  ];

  // 模拟歌词数据
  const lyricsData = {
    1: [ // 我记得 - 赵雷
      { time: 0, text: "我记得 - 赵雷" },
      { time: 5, text: "" },
      { time: 10, text: "前方那座最高的山岗" },
      { time: 15, text: "好像是妈妈曾经的模样" },
      { time: 20, text: "我走了一天一夜的路" },
      { time: 25, text: "只为了找到那朵野菊花" },
      { time: 30, text: "我记得我记得" },
      { time: 35, text: "妈妈的模样" },
      { time: 40, text: "我记得我记得" },
      { time: 45, text: "回家的方向" }
    ],
    2: [ // 遗憾 - 屿川
      { time: 0, text: "遗憾 - 屿川" },
      { time: 5, text: "" },
      { time: 10, text: "怎么学会隐藏我的难过" },
      { time: 15, text: "怎么学会笑着说无所谓" },
      { time: 20, text: "那些没说出口的话" },
      { time: 25, text: "都成了遗憾" },
      { time: 30, text: "那些没来得及的拥抱" },
      { time: 35, text: "都成了永远" }
    ],
    default: [ // 默认歌词
      { time: 0, text: "暂无歌词" },
      { time: 5, text: "正在努力加载中..." }
    ]
  };

  // ========== 全局播放状态 ==========
  let isPlaying = false;
  let currentTime = 0;
  let totalTime = 0;
  let currentSongIndex = 0;
  let currentPlaylist = [];
  let progressInterval = null;
  let lastActivePage = 'home'; // 记录最后活跃的页面，用于返回

  // ========== 页面切换函数（自动隐藏/显示） ==========
  // 显示首页
  function showHomePage() {
    homePage.style.display = 'block';
    searchPage.style.display = 'none';
    playlistDetailPage.style.display = 'none';
    playerDetailPage.style.display = 'none';
    stopProgressUpdate();
    lastActivePage = 'home';
  }

  // 显示搜索页
  function showSearchPage() {
    homePage.style.display = 'none';
    searchPage.style.display = 'block';
    playlistDetailPage.style.display = 'none';
    playerDetailPage.style.display = 'none';
    stopProgressUpdate();
    lastActivePage = 'search';
  }

  // 显示歌单详情页
  function showPlaylistDetailPage() {
    homePage.style.display = 'none';
    searchPage.style.display = 'none';
    playlistDetailPage.style.display = 'block';
    playerDetailPage.style.display = 'none';
    stopProgressUpdate();
    lastActivePage = 'playlist';
  }

  // 显示播放详情页
  function showPlayerDetailPage() {
    homePage.style.display = 'none';
    searchPage.style.display = 'none';
    playlistDetailPage.style.display = 'none';
    playerDetailPage.style.display = 'flex';
    lastActivePage = 'player';
  }

  // ========== 歌单点击事件 ==========
  // 歌单1
  document.getElementById('playlist1').onclick = function () {
    showPlaylistDetailPage();
    showPlaylistDetail(1);
  };
  // 歌单2
  document.getElementById('playlist2').onclick = function () {
    showPlaylistDetailPage();
    showPlaylistDetail(2);
  };
  // 歌单3
  document.getElementById('playlist3').onclick = function () {
    showPlaylistDetailPage();
    showPlaylistDetail(3);
  };

  // ========== 我喜欢的音乐点击事件 ==========
  const likeMusicItem = document.querySelector('.nav-item:nth-child(2)');
  likeMusicItem.onclick = function () {
    showPlaylistDetailPage();
    loadLikeSongs();
  };

  // ========== 显示歌单详情 ==========
  function showPlaylistDetail(playlistId) {
    // 获取当前歌单数据
    const pl = playlistData[playlistId];
    currentPlaylist = pl.songs;

    // 更新详情页内容
    document.getElementById('detailCover').src = pl.cover;
    document.getElementById('detailPlayCount').textContent = pl.playCount;
    document.getElementById('detailTitle').textContent = pl.title;
    document.getElementById('detailDesc').textContent = pl.desc;
    document.getElementById('detailCreator').textContent = pl.creator;
    document.getElementById('detailCreateTime').textContent = pl.createTime;
    document.querySelector('.add-btn span').textContent = pl.addCount;
    document.getElementById('songCount').textContent = pl.songCount;

    // 更新标签
    const tagsContainer = document.getElementById('detailTags');
    tagsContainer.innerHTML = '';
    pl.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });

    // 更新歌曲列表
    const songsList = document.getElementById('songsListBody');
    songsList.innerHTML = '';
    pl.songs.forEach((song, index) => {
      const songItem = document.createElement('div');
      songItem.className = 'song-item';
      songItem.innerHTML = `
                <div class="song-num">${index + 1}</div>
                <div class="song-title">
                    <div class="song-cover-small">
                        <img src="${song.cover}" alt="${song.title}">
                    </div>
                    <div>
                        <div class="song-name">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="song-album">${song.album}</div>
                <div class="song-like">♥</div>
                <div class="song-duration">${song.duration}</div>
            `;
      // 歌曲点击播放
      songItem.onclick = function () {
        openPlayerDetail(song, pl.songs, index);
      };
      songsList.appendChild(songItem);
    });
  }

  // ========== 加载我喜欢的音乐 ==========
  function loadLikeSongs() {
    // 更新详情页标题等信息
    document.getElementById('detailCover').src = "https://picsum.photos/300/300?random=4";
    document.getElementById('detailPlayCount').textContent = "89.6万";
    document.getElementById('detailTitle').textContent = "我喜欢的音乐";
    document.getElementById('detailDesc').textContent = "收藏你喜欢的音乐，打造专属歌单";
    document.getElementById('detailCreator').textContent = "苗木东子";
    document.getElementById('detailCreateTime').textContent = "2025-01-01创建";
    document.querySelector('.add-btn span').textContent = "128";
    document.getElementById('songCount').textContent = likeSongs.length;

    // 更新标签
    const tagsContainer = document.getElementById('detailTags');
    tagsContainer.innerHTML = '';
    const tags = ["喜欢", "收藏", "私人"];
    tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });

    // 更新歌曲列表
    const songsList = document.getElementById('songsListBody');
    songsList.innerHTML = '';
    likeSongs.forEach((song, index) => {
      const songItem = document.createElement('div');
      songItem.className = 'song-item';
      songItem.innerHTML = `
                <div class="song-num">${index + 1}</div>
                <div class="song-title">
                    <div class="song-cover-small">
                        <img src="${song.cover}" alt="${song.title}">
                    </div>
                    <div>
                        <div class="song-name">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="song-album">${song.album}</div>
                <div class="song-like" style="color: #e83e3e;">♥</div>
                <div class="song-duration">${song.duration}</div>
            `;
      // 歌曲点击播放
      songItem.onclick = function () {
        openPlayerDetail(song, likeSongs, index);
      };
      songsList.appendChild(songItem);
    });
  }

  // ========== 打开播放详情页 ==========
  function openPlayerDetail(song, playlistData, index = 0) {
    // 显示播放详情页
    showPlayerDetailPage();

    // 更新播放状态
    currentPlaylist = playlistData;
    currentSongIndex = index;
    currentTime = 0;
    totalTime = convertTimeToSeconds(song.duration);

    // 更新页面内容
    document.getElementById('detailAlbumCover').src = song.cover;
    document.getElementById('detailSongTitle').textContent = song.title;
    document.getElementById('detailArtist').textContent = song.artist;
    document.getElementById('detailAlbum').textContent = song.album;
    totalTimeEl.textContent = song.duration;
    currentTimeEl.textContent = "00:00";

    // 重置进度条
    progressCurrentDetail.style.width = "0%";
    progressHandleDetail.style.left = "0%";

    // 渲染歌词
    renderLyrics(song.id);

    // 自动播放
    isPlaying = true;
    vinylRecord.classList.add('playing');
    tonearm.classList.add('playing');
    playIcon.textContent = "❚❚";
    startProgressUpdate();
  }

  // ========== 渲染歌词 ==========
  function renderLyrics(songId) {
    lyricsContent.innerHTML = '';
    const lyrics = lyricsData[songId] || lyricsData.default;

    lyrics.forEach(line => {
      const lineEl = document.createElement('div');
      lineEl.className = 'line';
      lineEl.textContent = line.text;
      lineEl.dataset.time = line.time;
      lyricsContent.appendChild(lineEl);
    });
  }

  // ========== 更新歌词高亮 ==========
  function updateLyricsHighlight(time) {
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
      if (parseInt(line.dataset.time) <= time) {
        line.classList.add('active');
        // 自动滚动到当前歌词
        lyricsContainer.scrollTop = line.offsetTop - lyricsContainer.offsetHeight / 2;
      } else {
        line.classList.remove('active');
      }
    });
  }

  // ========== 播放控制 ==========
  // 播放/暂停
  playPauseBtn.onclick = function () {
    isPlaying = !isPlaying;

    if (isPlaying) {
      vinylRecord.classList.add('playing');
      tonearm.classList.add('playing');
      playIcon.textContent = "❚❚";
      startProgressUpdate();
    } else {
      vinylRecord.classList.remove('playing');
      tonearm.classList.remove('playing');
      playIcon.textContent = "▶";
      stopProgressUpdate();
    }
  };

  // 上一首
  prevBtn.onclick = function () {
    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    const prevSong = currentPlaylist[currentSongIndex];
    openPlayerDetail(prevSong, currentPlaylist, currentSongIndex);
  };

  // 下一首
  nextBtn.onclick = function () {
    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    const nextSong = currentPlaylist[currentSongIndex];
    openPlayerDetail(nextSong, currentPlaylist, currentSongIndex);
  };

  // ========== 进度条控制 ==========
  function startProgressUpdate() {
    stopProgressUpdate(); // 先停止之前的定时器
    progressInterval = setInterval(() => {
      currentTime += 1;

      // 播放完毕自动切歌
      if (currentTime >= totalTime) {
        nextBtn.click();
        return;
      }

      // 更新进度条
      const percent = (currentTime / totalTime) * 100;
      progressCurrentDetail.style.width = `${percent}%`;
      progressHandleDetail.style.left = `${percent}%`;
      currentTimeEl.textContent = formatTime(currentTime);

      // 更新歌词
      updateLyricsHighlight(currentTime);
    }, 1000);
  }

  function stopProgressUpdate() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  // 点击进度条跳转
  progressBarDetail.onclick = function (e) {
    const rect = progressBarDetail.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    currentTime = Math.floor(percent * totalTime);

    // 更新进度
    progressCurrentDetail.style.width = `${percent * 100}%`;
    progressHandleDetail.style.left = `${percent * 100}%`;
    currentTimeEl.textContent = formatTime(currentTime);

    // 更新歌词
    updateLyricsHighlight(currentTime);
  };

  // ========== 工具函数 ==========
  // 格式化时间（秒 -> mm:ss）
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // 转换时间（mm:ss -> 秒）
  function convertTimeToSeconds(timeStr) {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
  }

  // ========== 返回按钮事件 ==========
  // 歌单详情页返回键：返回首页
  backBtn.onclick = function () {
    showHomePage();
  };

  // 播放详情页返回键：返回上一个页面（歌单详情/首页）
  playerBackBtn.onclick = function () {
    stopProgressUpdate();
    isPlaying = false;
    vinylRecord.classList.remove('playing');
    tonearm.classList.remove('playing');
    playIcon.textContent = "▶";

    // 根据最后活跃页面返回
    if (lastActivePage === 'playlist') {
      showPlaylistDetailPage();
    } else {
      showHomePage();
    }
  };

  // ========== 其他交互 ==========
  // 搜索框聚焦
  searchInput.addEventListener('focus', showSearchPage);

  // 点击空白处返回首页（排除所有可交互区域）
  document.addEventListener('click', function (e) {
    const isClickOnSearch = searchInput.contains(e.target) || searchPage.contains(e.target);
    const isClickOnPlaylist = playlistDetailPage.contains(e.target) || document.querySelectorAll('.playlist-card').some(card => card.contains(e.target));
    const isClickOnPlayer = playerDetailPage.contains(e.target);
    const isClickOnSidebar = likeMusicItem.contains(e.target) || backBtn.contains(e.target) || playerBackBtn.contains(e.target);

    if (!isClickOnSearch && !isClickOnPlaylist && !isClickOnPlayer && !isClickOnSidebar) {
      showHomePage();
    }
  });

  // ESC键关闭播放详情页
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && playerDetailPage.style.display === 'flex') {
      playerBackBtn.click(); // 触发播放详情页返回键逻辑
    }
  });

  // 初始化显示首页
  showHomePage();
});