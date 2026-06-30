//------------------------//
//  WER - Window Manager  //
//------------------------//

var zlast = 1

document.querySelectorAll(".win").forEach(insertFunctions)
function insertFunctions(win){
  const header = win.querySelector(".winheader")
  header.innerHTML += `<div class="winl"><img src="base/system/icons/${win.dataset.windowicon}.png" class="windowicon"></img><span>${win.dataset.windowname}</span></div><div class="winr"><button class="minimwin" onclick="minimwin(this.closest('.win'))"></button><button class="closewin" onclick="closewin(this.closest('.win'))"></button></div>`
}
function minimwin(e){
  e.style.display="none"
}
function closewin(e){
  e.remove()
}
document.querySelectorAll(".win").forEach(dragElement)
function dragElement(element) {
  windowz(element)
  const header = element.querySelector(".winheader")
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;
  if (header) {
    
    header.onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }
  function startDragging(e) {
    windowz(element)
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }
  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.top = (element.offsetTop - currentY) + "px";
    element.style.left = (element.offsetLeft - currentX) + "px";
  }
  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
  function windowz(e){
    zlast++
    e.style.zIndex = zlast
  }
}
function initwindow(win){
  insertFunctions(win)
  dragElement(win)
}