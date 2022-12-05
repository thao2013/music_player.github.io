const $=document.querySelector.bind(document);
const $$=document.querySelectorAll.bind(document);

const audio=$('#player__audio');
const progess=$('#progress');
const next=$('.dashboard__next');
const back=$('.dashboard__back');
const mix=$('.dashboard__mix');
const repeat=$('.dashboard__repeat');   
const playlist=$('.playlist');
const PLAYER_STORAGE_KEY='PLAYER';

const app= 
    {
        currentIndex: 0,
        isPlaying: false,
        isMix: false,
        isRepeat: false,
        config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
        setConfig: function(key, value) {
            this.config[key] = value;
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
        },
        songs:[
            {
                name: 'Hỗn Thiên',
                singer: 'Ma đồng giáng thế',
                path: './assets/music/honthien.mp3',    
                image: './assets/images/6.png'
            },
            {
                name: 'Anh và quỷ dữ',
                singer: 'Dương Trần Nghĩa',
                path: './assets/music/Anh va Quy du.mp3',
                image: './assets/images/5.png'
            },
            {
                name: 'Dưới ánh hào quang',
                singer: 'Ngân Hà',
            path: './assets/music/Duoi Anh Hao Quang.mp3',
                image: './assets/images/4.png'
            },
            {
                name: 'Dứt con mưa này',
                singer: 'Hậu Huyền',
                path: './assets/music/Dut Con Mua Nay - Hau Huyen.mp3',
                image: './assets/images/1.png'
            },
            {
                name: 'Happy',
                singer: 'Skinnyfabs',
                path: './assets/music/happy - Skinnyfabs.mp3',
                image: './assets/images/3.png'
            },
            {
                name: 'Hình ảnh phản chiếu',
                singer: 'Lam Tâm Vũ',
                path: './assets/music/Hinh Anh Phan Chieu - Lam Tam Vu.mp3',
                image: './assets/images/2.png'
            }
        ]
    }
    
start();

function start(){
    // Gán cấu hình từ cofig và ứng dụng
    loadConfig();
    // Hiển thị trạng thái ban đầu của Mix và Repeat
    mix.classList.toggle('dashboard__active', app.isMix);
    repeat.classList.toggle('dashboard__active', app.isRepeat);

    // Định nghĩa các thuộc tính cho object
    defineProperties();

    // Xử lý các sự kiện
    handleEvents();

    // Cập nhật thông tin bài hát lên UI
    loadCurrentSong();

    // Render playlist
    render();
}

function render(){
    const htmls=app.songs.map((song, index) => {
        return `
            <div data-index='${index}' class="playlist-item ${index === app.currentIndex ? 'active' : ''}">
                <img src="${song.image}" alt="" class="playlist-item__img">
                <div class="playlist-item__body">
                    <span class="playlist-item__name">${song.name}</span>
                    <span class="playlist-item__singer">${song.singer}</span>
                </div>
                <span class="playlist-item__options">
                    <i class="fa-solid fa-ellipsis"></i>
                </span>
            </div>
        `;
    })
    playlist.innerHTML=htmls.join('');
}

function handleEvents(){

    // Xu lu phong to thu nho cd 
    const cd=$('.dashboard__music-img');
    const cdWidth=cd.offsetWidth;
    document.onscroll=function(){
        const scrollTop=window.scrollY||document.documentElement.scrollTop;
        const newWidth=cdWidth - scrollTop; 

        cd.style.width=newWidth > 0 ? newWidth + 'px': 0;
        cd.style.height=newWidth > 0 ? newWidth + 'px': 0;

    }

    // Xoay cd khi play
    const cdAnimate=cd.animate([
        { transform: 'rotate(360deg)' }
    ],{
        duration: 20000,
        iterations: Infinity
    })

    cdAnimate.pause();

    // Xu ly play
    $('.dashboard__play').onclick=function(){
        if(app.isPlaying){
            audio.pause();
        }
        else{
            audio.play();
            
        }
    }

     // Khi bài hát được play
    audio.onplay=function(){
        app.isPlaying=true;
        $('.player').classList.add('playing');
        cdAnimate.play();
    }

    audio.onpause=function(){
        app.isPlaying=false;
        $('.player').classList.remove('playing');
        cdAnimate.pause();
    }

    // Thời gian phát nhạc
    audio.ontimeupdate=function(){
        if(audio.duration){
            const progessPecent=Math.floor((audio.currentTime / audio.duration) * 100);
            progess.value=progessPecent;
        }
    }

    // Tua nhạc
    progess.onchange=function(){
        audio.currentTime=(progess.value * audio.duration) / 100;
    }

    // Phát bài hát tiếp theo
    next.onclick=function(){
        if(app.isMix){
            mixSong();
        }
        else{
            nextSong();
        }
        audio.play();
        render();
        scrollToActiveSong();
    }

    // Phát bài phía trước
    back.onclick=function(){
        if(app.isMix){
            mixSong();
        }
        else{
            backSong(); 
        }
        audio.play();
        render();
        scrollToActiveSong();
    }

    // Trộn bài hát
    mix.onclick=function(){
        app.isMix=!app.isMix;
        app.setConfig('isMix',app.isMix);
        this.classList.toggle('dashboard__active', app.isMix);
    }
    // Next khi hết bài hát
    audio.onended=function(){
        if(app.isRepeat){
            audio.play();
        }
        else{
            next.click();
        }
    }

    // Xử lý repeat
    repeat.onclick=function(){
        app.isRepeat=!app.isRepeat;
        app.setConfig('isRepeat',app.isRepeat);
        this.classList.toggle('dashboard__active', app.isRepeat);
    }

    // Click vào bài hát
    playlist.onclick=function(e){
        const nodeSong=e.target.closest('.playlist-item:not(.active)');
        const nodeOption=e.target.closest('.playlist-item__options');
        if(nodeSong || nodeOption){
            if(!nodeOption){
                app.currentIndex=Number(nodeSong.dataset.index);
                render();
                loadCurrentSong();
                audio.play();
            }
            else{
                console.log('option')
            }
        }
    }
}

function defineProperties(){
    Object.defineProperty(
        app,'currentSong',{
            get: ()=>app.songs[app.currentIndex]
        }
    )
}

function loadCurrentSong(){
    $('.dashboard__namelist').textContent=app.currentSong.name;
    $('.dashboard__music-img').src=app.currentSong.image;
    audio.src=app.currentSong.path;
}

function nextSong(){
    app.currentIndex+=1;
    if(app.currentIndex>=app.songs.length){
        app.currentIndex=0;
    }
    loadCurrentSong();
}

function backSong(){
    app.currentIndex-=1;
    if(app.currentIndex<0){
        app.currentIndex=app.songs.length-1;
    }
    loadCurrentSong();
}

function mixSong(){
    let newCurrent  
    do{
        newCurrent=Math.floor(Math.random() * app.songs.length);
    }while(newCurrent==app.currentIndex)
    app.currentIndex=newCurrent;   
    loadCurrentSong(); 
}

function scrollToActiveSong(){
    setTimeout(
        $('.playlist-item.active').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
    }),300)
}

function loadConfig(){
    app.isMix=app.config.isMix;
    app.isRepeat=app.config.isRepeat;
}
