// Геометрия сада для перехода; сама доска не интерактивна.
import { TREE_BREAK } from './portfolio-tree-motion.js';
export function portfolioSceneGeometry(homeTarget = false) {
  const image = document.querySelector('.garden-base');
  const style = getComputedStyle(image);
  let rect = image.getBoundingClientRect();
  if (homeTarget) {
    const width = image.clientWidth, height = image.clientHeight;
    rect = {left:-width*.03*.65,top:-height*.03*.6,width:width*1.03,height:height*1.03};
  }
  const scale = Math.max(rect.width/1800,rect.height/1200);
  const positions = style.objectPosition.split(' ');
  const fraction = (value,fallback) => value?.endsWith('%') ? parseFloat(value)/100 : fallback;
  const x = rect.left+(rect.width-1800*scale)*fraction(positions[0],.5);
  const y = rect.top+(rect.height-1200*scale)*fraction(positions[1],.5);
  return {
    board:{left:x+1236*scale,top:y+698*scale,width:250*scale,height:174*scale},
    lamp:{x:x+1221*scale,y:y+799*scale},
    scene:{left:x,top:y,width:1800*scale,height:1200*scale},
    strike:{x:x+TREE_BREAK.x*scale,y:y+TREE_BREAK.y*scale},
    trunk:{left:x+1455*scale,top:y+650*scale,width:66*scale,height:550*scale},
    scale
  };
}

