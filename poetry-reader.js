import { poetryArtMarkup } from './poetry-art.js';

// Число строф в сцене и рисунок. Последняя сцена забирает остаток текста,
// поэтому авторские дополнения не теряются при редактировании poems.js.
const scenes={
  morning:[[2,'morning'],[Infinity,'morningRoom']],
  knight:[[2,'knight'],[2,'knightShelter'],[Infinity,'knightRelease']],
  hamster:[[2,'hamster'],[Infinity,'emptyHouse']],
  boxes:[[Infinity,'boxes']],
  dream:[[2,'dream'],[2,'metroEmbrace'],[Infinity,'dreamWaking']],
  nature:[[2,'nature'],[2,'winterBridge'],[2,'harvestHeart'],[2,'riverLetter'],[Infinity,'springFarewell']],
  walls:[[2,'walls'],[2,'forestFracture'],[2,'wardCoat'],[2,'dressHall'],[2,'cradleMirror'],[2,'targetForest'],[Infinity,'mindRoom']]
};
function decoration(key) {
  const node=document.createElement('span');node.className='poem-scene-art';
  node.setAttribute('aria-hidden','true');node.innerHTML=poetryArtMarkup(key);return node;
}
export function renderPoemBody(container,poem) {
  const stanzas=poem.body.split(/\n[\t ]*\n/);
  const plans=scenes[poem.artwork]||[[Infinity,poem.artwork]];
  const content=document.createDocumentFragment();
  let cursor=0;
  for(const [count,key] of plans) {
    if(cursor>=stanzas.length)break;
    const group=document.createElement('div');group.className='poem-scene';group.dataset.artwork=key;
    group.append(decoration(key));
    const end=Math.min(stanzas.length,cursor+count);
    while(cursor<end) {
      const stanza=document.createElement('div');stanza.className='poem-stanza';
      const paragraph=document.createElement('p');paragraph.className='poem-stanza-text';paragraph.textContent=stanzas[cursor++];
      stanza.append(paragraph);group.append(stanza);
    }
    group.dataset.stanzas=String(group.querySelectorAll('.poem-stanza').length);
    content.append(group);
  }
  container.replaceChildren(content);container.dataset.stanzaCount=String(stanzas.length);
}
