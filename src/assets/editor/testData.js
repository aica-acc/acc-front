/**
 * 테스트용 더미데이터
 * public/data/test 폴더에 있는 이미지와 영상 파일들을 테스트하기 위한 데이터
 */

export const testMediaData = [
  {
    id: 1,
    type: 'image',
    url: '/data/test/image1.png',
    name: '테스트 이미지 1',
    width: 300,
    height: 300,
    left: 100,
    top: 100,
  },
  {
    id: 2,
    type: 'image',
    url: '/data/test/imgae2.png', // 실제 파일명: imgae2.png (오타)
    name: '테스트 이미지 2',
    width: 250,
    height: 250,
    left: 450,
    top: 100,
  },
  {
    id: 3,
    type: 'video',
    url: '/data/test/video1.mp4',
    name: '테스트 영상 1',
    width: 400,
    height: 300,
    left: 100,
    top: 400,
    autoplay: false,
    controls: true,
    loop: false,
  },
  {
    id: 4,
    type: 'video',
    url: '/data/test/video2.mp4',
    name: '테스트 영상 2',
    width: 350,
    height: 200,
    left: 550,
    top: 400,
    autoplay: false,
    controls: true,
    loop: false,
  },
  {
    id: 5,
    type: 'image',
    url: '/data/test/mascot1.png',
    name: '마스코트 이미지 1',
    width: 200,
    height: 200,
    left: 100,
    top: 750,
  }
];

// testMediaData를 EditorPage 형태의 items로 변환
export const testItems = testMediaData.map((media) => {
  // 각 미디어를 하나의 디자인으로 변환
  const canvasWidth = 3840;
  const canvasHeight = 2160;
  
  // 객체 생성 (left/top이 없으면 중앙 배치를 위해 undefined로 설정)
  const obj = {
    role: media.name,
    type: media.type,
    width: media.width,
    height: media.height,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
  };
  
  // left/top이 있으면 설정, 없으면 undefined (중앙 배치)
  if (media.left !== undefined) {
    obj.left = media.left;
  }
  if (media.top !== undefined) {
    obj.top = media.top;
  }
  
  // type에 따라 속성 추가
  if (media.type === 'image') {
    obj.src = media.url;
  } else if (media.type === 'video') {
    obj.videoUrl = media.url;
  }
  
  return {
    id: media.id,
    type: media.type,
    category: media.name,
    backgroundImageUrl: null, // 배경 이미지 없음
    canvasData: {
      width: canvasWidth,
      height: canvasHeight,
      objects: [obj]
    }
  };
});


