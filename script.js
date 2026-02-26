
document.addEventListener('DOMContentLoaded', function () {
  const API_BASE_URL = 'http://localhost:3000';

  const homePage = document.getElementById('homePage');
  const searchPage = document.getElementById('searchPage');
  const playlistDetailPage = document.getElementById('playlistDetailPage');
  const playerDetailPage = document.getElementById('playerDetailPage');
  const searchInput = document.getElementById('searchInput');
  const backBtn = document.getElementById('backBtn');
  const playerBackBtn = document.createElement('button');

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
  let playlistData = {};
  let likeSongs = []; // 我喜欢的音乐列表
  async function fetchRecommendPlaylists() {
    try {
      // 获取热门歌单
      const response = await fetch(`${API_BASE_URL}/top/playlist?limit=6`);
      const data = await response.json();

      if (data.code === 200 && data.playlists) {
        // 格式化歌单数据
        const playlists = data.playlists.slice(0, 3); // 只取前3个用于首页显示
        playlists.forEach((playlist, index) => {
          const playlistId = index + 1;
          playlistData[playlistId] = {
            cover: playlist.coverImgUrl,
            playCount: formatPlayCount(playlist.playCount),
            title: playlist.name,
            desc: playlist.description || '暂无描述',
            creator: playlist.creator.nickname,
            tags: playlist.tags || [],
            createTime: new Date(playlist.createTime).toLocaleDateString(),
            addCount: playlist.bookCount || 0,
            songCount: playlist.trackCount,
            songs: [] // 歌曲列表稍后单独获取
          };

          // 更新首页歌单显示
          updateHomePlaylist(playlistId, playlistData[playlistId]);

          // 获取该歌单的歌曲详情
          fetchPlaylistSongs(playlist.id, playlistId);
        });
      }
    } catch (error) {
      console.error('获取推荐歌单失败：', error);
      // 如果失败，使用备用数据
      useFallbackPlaylistData();
    }
  }

  // 获取歌单内的歌曲
  async function fetchPlaylistSongs(playlistApiId, localId) {
    try {
      const response = await fetch(`${API_BASE_URL}/playlist/detail?id=${playlistApiId}`);
      const data = await response.json();

      if (data.code === 200 && data.playlist) {
        const tracks = data.playlist.tracks.slice(0, 10); // 取前10首

        playlistData[localId].songs = tracks.map(track => ({
          id: track.id,
          title: track.name,
          artist: track.ar.map(a => a.name).join('/'),
          album: track.al.name,
          duration: formatDuration(track.dt),
          cover: track.al.picUrl
        }));

        // 如果当前正在显示这个歌单，更新显示
        if (document.getElementById('playlistDetailPage').style.display === 'block') {
          // 这里需要知道当前显示的是哪个歌单
        }
      }
    } catch (error) {
      console.error('获取歌单歌曲失败：', error);
    }
  }

  // 获取我喜欢的音乐（根据用户喜好推荐）
  async function fetchLikeSongs() {
    try {
      // 获取推荐歌曲
      const response = await fetch(`${API_BASE_URL}/recommend/songs`);
      const data = await response.json();

      if (data.code === 200 && data.data && data.data.dailySongs) {
        const dailySongs = data.data.dailySongs.slice(0, 10);

        likeSongs = dailySongs.map(song => ({
          id: song.id,
          title: song.name,
          artist: song.ar.map(a => a.name).join('/'),
          album: song.al.name,
          duration: formatDuration(song.dt),
          cover: song.al.picUrl
        }));
      }
    } catch (error) {
      console.error('获取推荐歌曲失败：', error);
      // 使用备用数据
      useFallbackLikeSongs();
    }
  }

  // 格式化播放数
  function formatPlayCount(count) {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  }

  // 格式化时长
  function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // 更新首页歌单显示
  function updateHomePlaylist(index, data) {
    const playlistCard = document.getElementById(`playlist${index}`);
    if (playlistCard) {
      const coverImg = playlistCard.querySelector('img');
      const playCountSpan = playlistCard.querySelector('.play-count span:last-child');
      const nameDiv = playlistCard.querySelector('.playlist-name');

      if (coverImg) coverImg.src = data.cover;
      if (playCountSpan) playCountSpan.textContent = data.playCount;
      if (nameDiv) nameDiv.textContent = data.title;
    }
  }
  // ========== 全局播放状态 ==========
  let isPlaying = false;
  let currentTime = 0;
  let totalTime = 0;
  let currentSongIndex = 0;
  let currentPlaylist = [];
  let lastActivePage = 'home';

  // ========== 音频相关变量 ==========
  let audioPlayer = null;
  let currentSongId = null;
  let isMuted = false;
  let previousVolume = 0.8;
  let currentVolume = 0.8;

  // ========== 底部播放栏元素 ==========
  const bottomSongCoverImg = document.getElementById('bottomSongCoverImg');
  const bottomSongName = document.getElementById('bottomSongName');
  const bottomSingerName = document.getElementById('bottomSingerName');
  const bottomPlayBtn = document.getElementById('bottomPlayBtn');
  const bottomPlayIcon = bottomPlayBtn?.querySelector('span');
  const bottomPrevBtn = document.getElementById('bottomPrevBtn');
  const bottomNextBtn = document.getElementById('bottomNextBtn');
  const bottomProgressBar = document.getElementById('bottomProgressBar');
  const bottomProgressCurrent = document.getElementById('bottomProgressCurrent');
  const bottomProgressHandle = document.getElementById('bottomProgressHandle');
  const bottomCurrentTime = document.getElementById('bottomCurrentTime');
  const bottomTotalTime = document.getElementById('bottomTotalTime');
  const bottomVolumeBtn = document.getElementById('bottomVolumeBtn');

  // 底部播放栏本身
  const playerBar = document.getElementById('playerBar');

  // 初始化时隐藏底部播放栏
  if (playerBar) {
    playerBar.classList.add('hidden');
  }

  // ========== 页面切换函数 ==========
  function showHomePage() {
    homePage.style.display = 'block';
    searchPage.style.display = 'none';
    playlistDetailPage.style.display = 'none';
    playerDetailPage.style.display = 'none';
    lastActivePage = 'home';
  }

  function showSearchPage() {
    homePage.style.display = 'none';
    searchPage.style.display = 'block';
    playlistDetailPage.style.display = 'none';
    playerDetailPage.style.display = 'none';
    lastActivePage = 'search';
  }

  function showPlaylistDetailPage() {
    homePage.style.display = 'none';
    searchPage.style.display = 'none';
    playlistDetailPage.style.display = 'block';
    playerDetailPage.style.display = 'none';
    lastActivePage = 'playlist';
  }

  function showPlayerDetailPage() {
    homePage.style.display = 'none';
    searchPage.style.display = 'none';
    playlistDetailPage.style.display = 'none';
    playerDetailPage.style.display = 'flex';
    lastActivePage = 'player';
  }

  // ========== 歌单点击事件 ==========
  document.getElementById('playlist1').onclick = function () {
    showPlaylistDetailPage();
    showPlaylistDetail(1);
  };
  document.getElementById('playlist2').onclick = function () {
    showPlaylistDetailPage();
    showPlaylistDetail(2);
  };
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
    if (!pl) {
      console.error('歌单不存在');
      return;
    }

    currentPlaylist = pl.songs || [];

    // 更新详情页内容
    document.getElementById('detailCover').src = pl.cover;
    document.getElementById('detailPlayCount').textContent = pl.playCount;
    document.getElementById('detailTitle').textContent = pl.title;
    document.getElementById('detailDesc').textContent = pl.desc;
    document.getElementById('detailCreator').textContent = pl.creator;
    document.getElementById('detailCreateTime').textContent = pl.createTime;

    // 更新收藏数
    const addBtnSpan = document.querySelector('.add-btn span');
    if (addBtnSpan) addBtnSpan.textContent = pl.addCount || 0;

    document.getElementById('songCount').textContent = pl.songCount || pl.songs.length;

    // 更新标签
    const tagsContainer = document.getElementById('detailTags');
    tagsContainer.innerHTML = '';
    if (pl.tags && pl.tags.length > 0) {
      pl.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      });
    }

    // 更新歌曲列表
    const songsList = document.getElementById('songsListBody');
    songsList.innerHTML = '';

    if (pl.songs && pl.songs.length > 0) {
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
    } else {
      // 如果歌曲列表为空，显示提示
      songsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">暂无歌曲</div>';
    }
  }

  function loadLikeSongs() {

    if (likeSongs.length === 0) {
      fetchLikeSongs();

    }

    document.getElementById('detailCover').src = "https://picsum.photos/300/300?random=4";
    document.getElementById('detailPlayCount').textContent = "实时推荐";
    document.getElementById('detailTitle').textContent = "每日推荐";
    document.getElementById('detailDesc').textContent = "根据你的听歌口味，每日更新的推荐歌单";
    document.getElementById('detailCreator').textContent = "网易云音乐";
    document.getElementById('detailCreateTime').textContent = new Date().toLocaleDateString() + "更新";
    document.querySelector('.add-btn span').textContent = likeSongs.length;
    document.getElementById('songCount').textContent = likeSongs.length;


    const tagsContainer = document.getElementById('detailTags');
    tagsContainer.innerHTML = '';
    const tags = ["推荐", "每日", "个性化"];
    tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });


    const songsList = document.getElementById('songsListBody');
    songsList.innerHTML = '';

    if (likeSongs.length > 0) {
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

        songItem.onclick = function () {
          openPlayerDetail(song, likeSongs, index);
        };
        songsList.appendChild(songItem);
      });
    } else {
      songsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">正在加载推荐歌曲...</div>';
    }
  }


  function openPlayerDetail(song, playlistData, index = 0) {
    showPlayerDetailPage();

    currentPlaylist = playlistData;
    currentSongIndex = index;
    currentSongId = song.id;

    document.getElementById('detailAlbumCover').src = song.cover || 'https://picsum.photos/300/300?random=' + song.id;
    document.getElementById('detailSongTitle').textContent = song.title;
    document.getElementById('detailArtist').textContent = song.artist;
    document.getElementById('detailAlbum').textContent = song.album || '未知专辑';

    updateBottomPlayer(song);

    totalTimeEl.textContent = song.duration || '03:30';
    currentTimeEl.textContent = "00:00";

    progressCurrentDetail.style.width = "0%";
    progressHandleDetail.style.left = "0%";

    lyricsContent.innerHTML = '<div class="line" style="text-align: center; color: #666;">正在加载歌词...</div>';

    getSongUrl(song.id);
    getSongLyrics(song.id);
  }

  // ========== 更新歌词高亮 ==========
  function updateLyricsHighlight(time) {
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
      const lineTime = parseFloat(line.dataset.time);
      if (!isNaN(lineTime) && lineTime <= time) {
        line.classList.add('active');
        lyricsContainer.scrollTop = line.offsetTop - lyricsContainer.offsetHeight / 2;
      } else {
        line.classList.remove('active');
      }
    });
  }


  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ========== 返回按钮事件 ==========
  backBtn.onclick = function () {
    showHomePage();
  };

  playerBackBtn.onclick = function () {
    if (lastActivePage === 'playlist') {
      showPlaylistDetailPage();
    } else {
      showHomePage();
    }
  };

  // ========== 搜索功能 ==========
  let searchTimer = null;

  searchInput.addEventListener('input', function () {
    const keyword = this.value.trim();

    if (searchTimer) clearTimeout(searchTimer);

    if (keyword === '') {
      showSearchPage();
      return;
    }

    searchTimer = setTimeout(() => {
      performSearch(keyword);
    }, 500);
  });

  searchInput.addEventListener('focus', function () {
    const keyword = this.value.trim();
    if (keyword === '') showSearchPage();
  });

  function performSearch(keyword) {
    showSearchPage();

    const searchPage = document.getElementById('searchPage');
    searchPage.innerHTML = `
      <div class="guess-like">
        <div class="nav-title">搜索 "${keyword}"</div>
        <div style="text-align: center; padding: 40px; color: #999;">搜索中...</div>
      </div>
    `;

    fetch(`http://localhost:3000/search?keywords=${encodeURIComponent(keyword)}`)
      .then(res => res.json())
      .then(res => {
        console.log('搜索结果：', res);
        if (res.code === 200 && res.result && res.result.songs) {
          displaySearchResults(res.result, keyword);
        } else {
          searchPage.innerHTML = `
            <div class="guess-like">
              <div class="nav-title">搜索 "${keyword}"</div>
              <div style="text-align: center; padding: 40px; color: #999;">没有找到相关结果</div>
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('搜索失败：', error);
        searchPage.innerHTML = `
          <div class="guess-like">
            <div class="nav-title">搜索失败</div>
            <div style="text-align: center; padding: 40px; color: #999;">网络错误，请稍后重试</div>
          </div>
        `;
      });
  }

  function displaySearchResults(result, keyword) {
    const searchPage = document.getElementById('searchPage');
    const songs = result.songs || [];
    const songCount = result.songCount || songs.length;

    let html = `
      <div class="guess-like">
        <div class="nav-title">搜索 "${keyword}" 的结果 (共${songCount}首)</div>
        <div class="search-results" style="margin-top: 16px;">
    `;

    songs.forEach((song, index) => {
      let artists = '';
      if (song.artists && song.artists.length > 0) {
        artists = song.artists.map(artist => artist.name).join('/');
      } else if (song.ar) {
        artists = song.ar.map(artist => artist.name).join('/');
      }

      let albumName = '';
      if (song.album && song.album.name) {
        albumName = song.album.name;
      } else if (song.al && song.al.name) {
        albumName = song.al.name;
      }

      const songId = song.id;
      const duration = song.duration || 0;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      let coverUrl = 'https://picsum.photos/32/32?random=' + songId;
      if (song.album && song.album.picUrl) {
        coverUrl = song.album.picUrl;
      } else if (song.al && song.al.picUrl) {
        coverUrl = song.al.picUrl;
      }

      html += `
        <div class="search-result-item" data-songid="${songId}" data-songname="${song.name}" data-artist="${artists}" data-album="${albumName}" data-cover="${coverUrl}" data-duration="${durationStr}" style="
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s;
        ">
          <div style="width: 40px; color: ${index < 3 ? '#e83e3e' : '#999'}; font-weight: ${index < 3 ? 'bold' : 'normal'};">${index + 1}</div>
          <div style="width: 32px; height: 32px; margin-right: 12px;">
            <img src="${coverUrl}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;" alt="${song.name}">
          </div>
          <div style="flex: 2; font-weight: 500;">${song.name}</div>
          <div style="flex: 1; color: #666;">${artists}</div>
          <div style="flex: 1; color: #999; font-size: 13px;">${albumName}</div>
          <div style="width: 60px; color: #999; font-size: 13px;">${durationStr}</div>
          <div style="width: 40px; color: #e83e3e; text-align: center;">▶</div>
        </div>
      `;
    });

    html += `</div></div>`;
    searchPage.innerHTML = html;

    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', function () {
        const song = {
          id: this.dataset.songid,
          title: this.dataset.songname,
          artist: this.dataset.artist,
          album: this.dataset.album,
          duration: this.dataset.duration,
          cover: this.dataset.cover
        };
        // 将搜索结果加入播放列表
        currentPlaylist = songs.map(s => ({
          id: s.id,
          title: s.name,
          artist: s.artists ? s.artists.map(a => a.name).join('/') : (s.ar ? s.ar.map(a => a.name).join('/') : ''),
          album: s.album ? s.album.name : (s.al ? s.al.name : ''),
          duration: formatTime(Math.floor((s.duration || 0) / 1000)),
          cover: s.album?.picUrl || s.al?.picUrl || 'https://picsum.photos/32/32?random=' + s.id
        }));
        currentSongIndex = songs.findIndex(s => s.id.toString() === song.id);
        openPlayerDetail(song, currentPlaylist, currentSongIndex);
      });
    });
  }

  // ========== 底部播放栏更新函数 ==========
  function updateBottomPlayer(song) {
    if (!song) return;

    // 只有在有有效歌曲时才显示底部播放栏
    if (song.title && song.title !== '暂无播放') {
      if (playerBar) {
        playerBar.classList.remove('hidden');
      }

      if (bottomSongCoverImg) {
        bottomSongCoverImg.src = song.cover;
        bottomSongCoverImg.style.display = 'block';
      }
      if (bottomSongName) bottomSongName.textContent = song.title;
      if (bottomSingerName) bottomSingerName.textContent = song.artist;
    }
  }

  // 检查并隐藏底部播放栏（当没有歌曲播放时）
  function checkAndHidePlayerBar() {
    if (!audioPlayer && (!currentPlaylist || currentPlaylist.length === 0)) {
      if (playerBar) {
        playerBar.classList.add('hidden');
      }
    }
  }

  // ========== 播放和歌词功能 ==========

  function getSongUrl(songId) {
    fetch(`http://localhost:3000/song/url?id=${songId}`)
      .then(res => res.json())
      .then(res => {
        console.log('播放链接响应：', res);
        if (res.data && res.data[0] && res.data[0].url) {
          playSong(res.data[0].url);
        } else {
          alert('该歌曲暂时无法播放');
          resetPlayState();
        }
      })
      .catch(error => {
        console.error('获取播放链接失败：', error);
        alert('获取播放链接失败');
        resetPlayState();
      });
  }

  function resetPlayState() {
    isPlaying = false;
    vinylRecord.classList.remove('playing');
    tonearm.classList.remove('playing');
    playIcon.textContent = "▶";
    if (bottomPlayIcon) bottomPlayIcon.textContent = "▶";

    // 如果没有音频对象，隐藏底部播放栏
    if (!audioPlayer) {
      checkAndHidePlayerBar();
    }
  }

  function playSong(url) {
    // 确保底部播放栏显示
    if (playerBar) {
      playerBar.classList.remove('hidden');
    }

    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer = null;
    }

    audioPlayer = new Audio(url);
    audioPlayer.volume = currentVolume;

    audioPlayer.play()
      .then(() => {
        console.log('开始播放');
        isPlaying = true;
        vinylRecord.classList.add('playing');
        tonearm.classList.add('playing');
        playIcon.textContent = "❚❚";
        if (bottomPlayIcon) bottomPlayIcon.textContent = "❚❚";
      })
      .catch(error => {
        console.error('播放失败：', error);
        resetPlayState();
      });

    audioPlayer.addEventListener('ended', function () {
      console.log('播放结束，自动下一首');
      nextBtn.click();
    });

    audioPlayer.addEventListener('timeupdate', function () {
      if (audioPlayer && !isNaN(audioPlayer.duration)) {
        currentTime = Math.floor(audioPlayer.currentTime);
        totalTime = Math.floor(audioPlayer.duration);

        const currentFormatted = formatTime(currentTime);
        const totalFormatted = formatTime(totalTime);

        currentTimeEl.textContent = currentFormatted;
        totalTimeEl.textContent = totalFormatted;

        if (bottomCurrentTime) bottomCurrentTime.textContent = currentFormatted;
        if (bottomTotalTime) bottomTotalTime.textContent = totalFormatted;

        const percent = (currentTime / totalTime) * 100;
        progressCurrentDetail.style.width = `${percent}%`;
        progressHandleDetail.style.left = `${percent}%`;

        if (bottomProgressCurrent) bottomProgressCurrent.style.width = `${percent}%`;
        if (bottomProgressHandle) bottomProgressHandle.style.left = `${percent}%`;

        updateLyricsHighlight(currentTime);
      }
    });

    audioPlayer.addEventListener('loadedmetadata', function () {
      totalTime = Math.floor(audioPlayer.duration);
      totalTimeEl.textContent = formatTime(totalTime);
      if (bottomTotalTime) bottomTotalTime.textContent = formatTime(totalTime);
    });
  }

  function getSongLyrics(songId) {
    fetch(`http://localhost:3000/lyric?id=${songId}`)
      .then(res => res.json())
      .then(res => {
        console.log('歌词响应：', res);
        if (res.lrc && res.lrc.lyric) {
          displayLyrics(parseLyrics(res.lrc.lyric));
        } else {
          displayNoLyrics();
        }
      })
      .catch(error => {
        console.error('获取歌词失败：', error);
        displayNoLyrics();
      });
  }

  function parseLyrics(lyricStr) {
    const lines = lyricStr.split('\n');
    const parsed = [];

    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const text = match[4].trim();

        const time = minutes * 60 + seconds + milliseconds / 1000;

        if (text) {
          parsed.push({
            time: Math.floor(time),
            text: text
          });
        }
      }
    });

    parsed.sort((a, b) => a.time - b.time);
    return parsed;
  }

  function displayLyrics(lyrics) {
    if (!lyrics || lyrics.length === 0) {
      displayNoLyrics();
      return;
    }

    lyricsContent.innerHTML = '';
    lyrics.forEach(line => {
      const lineEl = document.createElement('div');
      lineEl.className = 'line';
      lineEl.textContent = line.text;
      lineEl.dataset.time = line.time;
      lyricsContent.appendChild(lineEl);
    });
  }

  function displayNoLyrics() {
    lyricsContent.innerHTML = `
      <div class="line" style="text-align: center; color: #666;">暂无歌词</div>
      <div class="line" style="text-align: center; color: #999; font-size: 14px;">纯音乐或者没有提供歌词</div>
    `;
  }

  // 进度条点击跳转
  progressBarDetail.onclick = function (e) {
    if (!audioPlayer) return;
    const rect = progressBarDetail.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
  };

  if (bottomProgressBar) {
    bottomProgressBar.onclick = function (e) {
      if (!audioPlayer) return;
      const rect = bottomProgressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioPlayer.currentTime = percent * audioPlayer.duration;
    };
  }

  // 播放/暂停
  playPauseBtn.onclick = function () {
    if (!audioPlayer) return;
    if (isPlaying) {
      audioPlayer.pause();
      isPlaying = false;
      vinylRecord.classList.remove('playing');
      tonearm.classList.remove('playing');
      playIcon.textContent = "▶";
      if (bottomPlayIcon) bottomPlayIcon.textContent = "▶";
    } else {
      audioPlayer.play();
      isPlaying = true;
      vinylRecord.classList.add('playing');
      tonearm.classList.add('playing');
      playIcon.textContent = "❚❚";
      if (bottomPlayIcon) bottomPlayIcon.textContent = "❚❚";
    }
  };

  if (bottomPlayBtn) {
    bottomPlayBtn.onclick = function () {
      if (!audioPlayer) return;

      if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        vinylRecord.classList.remove('playing');
        tonearm.classList.remove('playing');
        playIcon.textContent = "▶";
        bottomPlayIcon.textContent = "▶";
      } else {
        audioPlayer.play();
        isPlaying = true;
        vinylRecord.classList.add('playing');
        tonearm.classList.add('playing');
        playIcon.textContent = "❚❚";
        bottomPlayIcon.textContent = "❚❚";
      }
    };
  }

  // 切换歌曲函数
  function switchSong(song) {
    // 确保底部播放栏显示
    if (playerBar) {
      playerBar.classList.remove('hidden');
    }

    currentSongId = song.id;

    // 更新界面
    document.getElementById('detailAlbumCover').src = song.cover;
    document.getElementById('detailSongTitle').textContent = song.title;
    document.getElementById('detailArtist').textContent = song.artist;
    document.getElementById('detailAlbum').textContent = song.album;

    updateBottomPlayer(song);

    // 重置进度
    progressCurrentDetail.style.width = "0%";
    progressHandleDetail.style.left = "0%";
    currentTimeEl.textContent = "00:00";
    if (bottomCurrentTime) bottomCurrentTime.textContent = "00:00";

    lyricsContent.innerHTML = '<div class="line" style="text-align: center; color: #666;">正在加载歌词...</div>';

    // 停止当前播放
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer = null;
    }

    // 获取新歌
    getSongUrl(song.id);
    getSongLyrics(song.id);
  }

  // 上一首
  prevBtn.onclick = function () {
    if (currentPlaylist.length === 0) {
      alert('没有播放列表');
      return;
    }

    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    const prevSong = currentPlaylist[currentSongIndex];
    console.log('切换到上一首：', prevSong);
    switchSong(prevSong);
  };

  // 下一首
  nextBtn.onclick = function () {
    if (currentPlaylist.length === 0) {
      alert('没有播放列表');
      return;
    }

    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    const nextSong = currentPlaylist[currentSongIndex];
    console.log('切换到下一首：', nextSong);
    switchSong(nextSong);
  };

  // 底部上一首
  if (bottomPrevBtn) {
    bottomPrevBtn.onclick = function () {
      prevBtn.click();
    };
  }

  // 底部下一首
  if (bottomNextBtn) {
    bottomNextBtn.onclick = function () {
      nextBtn.click();
    };
  }

  // 音量控制
  if (bottomVolumeBtn) {
    bottomVolumeBtn.onclick = function () {
      if (!audioPlayer) return;

      if (isMuted) {
        audioPlayer.volume = previousVolume;
        currentVolume = previousVolume;
        isMuted = false;
        bottomVolumeBtn.textContent = "🔊";
      } else {
        previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        currentVolume = 0;
        isMuted = true;
        bottomVolumeBtn.textContent = "🔇";
      }
    };
  }

  // 创建音量滑块（简化版）
  function createVolumeSlider() {
    if (!bottomVolumeBtn) return;

    const volumeControl = document.createElement('div');
    volumeControl.className = 'volume-slider';
    volumeControl.innerHTML = `
      <input type="range" min="0" max="1" step="0.01" value="${currentVolume}" class="volume-range">
    `;
    volumeControl.style.cssText = `
      position: absolute;
      bottom: 80px;
      right: 120px;
      background: #333;
      padding: 15px;
      border-radius: 20px;
      display: none;
      z-index: 10000;
    `;

    document.querySelector('.player-bar').appendChild(volumeControl);

    const volumeRange = volumeControl.querySelector('.volume-range');
    volumeRange.style.cssText = `width: 100px; cursor: pointer;`;

    volumeRange.addEventListener('input', function (e) {
      const vol = parseFloat(e.target.value);
      if (audioPlayer) {
        audioPlayer.volume = vol;
        currentVolume = vol;
        isMuted = (vol === 0);
        bottomVolumeBtn.textContent = vol === 0 ? "🔇" : "🔊";
      }
    });

    bottomVolumeBtn.addEventListener('mouseenter', () => {
      volumeControl.style.display = 'block';
    });

    volumeControl.addEventListener('mouseleave', () => {
      volumeControl.style.display = 'none';
    });
  }

  createVolumeSlider();

  // ========== 轮播图功能 ==========
  function initCarousel() {
    const wrapper = document.getElementById('carouselWrapper');
    const indicators = document.querySelectorAll('.indicator');
    const items = document.querySelectorAll('.carousel-item');

    if (!wrapper || items.length === 0) return;

    let currentIndex = 0;
    const itemCount = items.length;

    // 更新轮播位置和指示器
    function goToSlide(index) {
      if (index < 0) index = itemCount - 1;
      if (index >= itemCount) index = 0;

      currentIndex = index;
      wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

      indicators.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // 点击指示器切换
    indicators.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
      });
    });

    // 自动轮播
    setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
  }

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .search-result-item:hover {
      background-color: #f9f9f9;
    }
    .search-result-item:active {
      background-color: #f0f0f0;
    }
  `;
  document.head.appendChild(style);

  // ========== 其他交互 ==========
  document.addEventListener('click', function (e) {
    const isClickOnSearch = searchInput.contains(e.target) || searchPage.contains(e.target);
    const isClickOnPlaylist = playlistDetailPage.contains(e.target) || document.querySelectorAll('.playlist-card');
    const isClickOnPlayer = playerDetailPage.contains(e.target);
    const isClickOnSidebar = likeMusicItem.contains(e.target) || backBtn.contains(e.target) || playerBackBtn.contains(e.target);

    if (!isClickOnSearch && !isClickOnPlaylist && !isClickOnPlayer && !isClickOnSidebar) {
      showHomePage();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && playerDetailPage.style.display === 'flex') {
      playerBackBtn.click();
    }
  });

  initCarousel();


  fetchRecommendPlaylists(); // 获取推荐歌单
  fetchLikeSongs(); // 获取我喜欢的音乐

  // 初始化显示首页
  showHomePage();
});