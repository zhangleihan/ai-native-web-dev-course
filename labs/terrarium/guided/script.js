// Adapted for teaching from the original terrarium's per-plant closure and delta movement.
// Pointer capture replaces document-wide onpointermove/onpointerup assignments.
document.querySelectorAll('.plant').forEach(dragElement);

function dragElement(plant) {
  let pointerId = null;
  let previousX = 0;
  let previousY = 0;

  plant.addEventListener('pointerdown', startDrag);
  plant.addEventListener('pointermove', moveDrag);
  plant.addEventListener('pointerup', stopDrag);
  plant.addEventListener('pointercancel', stopDrag);
  plant.addEventListener('lostpointercapture', stopDrag);
  plant.addEventListener('keydown', moveByKeyboard);

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || pointerId !== null) return;
    event.preventDefault();
    plant.focus({ preventScroll: true });
    pointerId = event.pointerId;
    previousX = event.clientX;
    previousY = event.clientY;
    plant.classList.add('dragging');
    plant.setPointerCapture(pointerId);
  }

  function moveDrag(event) {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - previousX;
    const dy = event.clientY - previousY;
    plant.style.left = plant.offsetLeft + dx + 'px';
    plant.style.top = plant.offsetTop + dy + 'px';
    previousX = event.clientX;
    previousY = event.clientY;
  }

  function stopDrag(event) {
    if (event.pointerId !== pointerId) return;
    const finishedId = pointerId;
    pointerId = null;
    plant.classList.remove('dragging');
    if (plant.hasPointerCapture(finishedId)) plant.releasePointerCapture(finishedId);
  }

  function moveByKeyboard(event) {
    const moves = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    const delta = moves[event.key];
    if (!delta || pointerId !== null) return;
    event.preventDefault();
    plant.style.left = plant.offsetLeft + delta[0] + 'px';
    plant.style.top = plant.offsetTop + delta[1] + 'px';
  }
}
