import { Howl } from 'howler';

const playSound = se => {
  let src = `/soundEffects/${se}`;
  const sound = new Howl({src, volume: 0.2});
  console.log(sound);
  sound.play();
}

export {playSound}