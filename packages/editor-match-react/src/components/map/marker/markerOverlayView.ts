import Component from '@egjs/component';
import _ from 'lodash';
import { SYNC_INFO_STATUS } from '../../../constants';
import type { SyncInfo } from '../../../types';
import { Events, EVENTS } from './egjs.marker.events';
export class MarkerOverlayView extends Component<Events> {
  readonly id: string | number;
  readonly label: string;

  overlayView: google.maps.OverlayView;

  #status: SYNC_INFO_STATUS;
  #targetElement: HTMLDivElement | null;
  #onMousemove: (e: MouseEvent) => void;
  #onMousedown: ((e: MouseEvent) => void) | null;
  #onMouseup: ((e: MouseEvent) => void) | null;
  readonly #onConfirmMarker: (e: Event) => void;
  readonly #onFixMarker: (e: Event) => void;
  readonly #onRemoveMarker: (e: Event) => void;
  readonly #onCancelMarker: (e: Event) => void;
  readonly #onRevokeMarker: (e: Event) => void;

  constructor({ id, label }: Pick<SyncInfo, 'id' | 'label'>) {
    super();

    const overlayView = new google.maps.OverlayView();

    this.id = id;
    this.label = label;
    this.#targetElement = null;

    overlayView.onAdd = _.bind(this.onAdd, this);
    overlayView.draw = _.bind(this.draw, this);
    overlayView.onRemove = _.bind(this.onRemove, this);

    this.overlayView = overlayView;

    this.#status = SYNC_INFO_STATUS.ENTER;

    this.#onMousemove = _.bind(this.onMousemove, this);
    this.#onConfirmMarker = _.bind(this.onConfirmMarker, this);
    this.#onFixMarker = _.bind(this.onFixMarker, this);
    this.#onRemoveMarker = _.bind(this.onRemoveMarker, this);
    this.#onCancelMarker = _.bind(this.onCancelMarker, this);
    this.#onRevokeMarker = _.bind(this.onRevokeMarker, this);

    this.#onMousedown = null;
    this.#onMouseup = null;
  }

  onMousemove(e: MouseEvent) {
    if (this.#status === SYNC_INFO_STATUS.REVOKE) {
      const $fixButton = this.#targetElement?.querySelector('#fix-button') as HTMLButtonElement;

      $fixButton.style.visibility = 'visible';
      $fixButton.style.position = 'relative';
    }

    const origin = this.overlayView.get('origin');
    const left = origin.clientX - e.clientX;
    const top = origin.clientY - e.clientY;

    const projection = this.overlayView.getProjection();

    const position = this.overlayView.get('position');
    const posPixel = projection.fromLatLngToDivPixel(position);

    if (!posPixel) {
      return;
    }

    const point = new google.maps.Point(posPixel.x - left, posPixel.y - top);
    const latlng = projection.fromDivPixelToLatLng(point);

    this.overlayView.set('origin', e);
    this.overlayView.set('position', latlng);

    const latlngJson = latlng!.toJSON();

    this.trigger(EVENTS.LATLNG_CHANGE, {
      type: EVENTS.LATLNG_CHANGE,
      payload: { id: this.id, latlng: latlngJson },
    });

    this.overlayView.draw();
  }

  onConfirmMarker(e: Event) {
    e.stopPropagation();

    this.trigger(EVENTS.COFIRM_MARKER, {
      type: EVENTS.COFIRM_MARKER,
      payload: { id: this.id },
    });
  }

  onFixMarker(e: Event) {
    e.stopPropagation();

    this.trigger(EVENTS.FIX_MARKER, {
      type: EVENTS.FIX_MARKER,
      payload: { id: this.id },
    });
  }

  onRemoveMarker(e: Event) {
    e.stopPropagation();

    this.trigger(EVENTS.REMOVE_MARKER, {
      type: EVENTS.REMOVE_MARKER,
      payload: { id: this.id },
    });
  }

  onCancelMarker(e: Event) {
    e.stopPropagation();

    this.trigger(EVENTS.CANCEL_MARKER, {
      type: EVENTS.CANCEL_MARKER,
      payload: { id: this.id },
    });
  }

  onRevokeMarker(e: Event) {
    e.stopPropagation();

    this.trigger(EVENTS.REVOKE_MARKER, {
      type: EVENTS.REVOKE_MARKER,
      payload: { id: this.id },
    });
  }
  onAdd() {
    const $div = document.createElement('div');

    $div.id = `${this.id}`;

    $div.draggable = false;
    $div.style.position = 'absolute';

    $div.innerHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px; max-width: 176px; max-height: 165px;">
                <div id="controls" style="position: relative; display: flex; gap: 3px; min-height: 32px;">
                <button id="confirm-button" style="width: 49px; height: 32px; background-color: #657786; color: #ffffff ">생성</button>
                <button id="cancel-button" style="width: 49px; height: 32px; background-color: #ffffff; color: #000000 ">취소</button>
                <button id="fix-button" style="width: 49px; height: 32px; background-color: #657786; color: #ffffff; visibility: hidden; position: absolute;">변경</button>
                <button id="remove-button" style="width: 49px; height: 32px; background-color: #ffffff; color: #000000; visibility: hidden; position: absolute;">삭제</button>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%;">
                  <div style="width: 100%; padding: 8px; text-align: center; border: 3px solid #49B0FE; font-size: 15px; border-radius: 40px; background-color: #ffffff">Mapping point</div>
                  <div style="width: 3px; height: 50px; background-color: #49B0FE"></div>
                  <div id="edge-point"  style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border-radius: 50%; background-color: #49B0FE;">
                  <div  style="width: 10px; height: 10px; border-radius: 50%; background-color: #138DEB;"></div>
                  </div>
                </div>
                </div>
              `;

    const $map = this.overlayView.get('map').getDiv();

    $map.addEventListener('mouseleave', function () {
      $div.draggable = false;
      google.maps.event.trigger($div, 'mouseup');
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const onMousedown = function (e: MouseEvent) {
      $div.style.cursor = 'move';
      $div.draggable = true;
      self.overlayView.getMap()?.set('draggable', false);
      self.overlayView.set('origin', e);

      const $map = self.overlayView.get('map').getDiv();
      $map.addEventListener('mousemove', self.#onMousemove);
    };

    $div.addEventListener('mousedown', onMousedown);

    const onMouseup = function () {
      self.overlayView.getMap()?.set('draggable', true);
      $div.style.cursor = 'default';
      $div.draggable = false;

      const $map = self.overlayView.get('map').getDiv();
      $map.removeEventListener('mousemove', self.#onMousemove);
    };

    $div.addEventListener('mouseup', onMouseup);

    this.#onMousedown = onMousedown;
    this.#onMouseup = onMouseup;

    const $confirmButton = $div.querySelector('#confirm-button');
    const $cancelButton = $div.querySelector('#cancel-button');
    const $fixButton = $div.querySelector('#fix-button');
    const $removeButton = $div.querySelector('#remove-button');

    $confirmButton?.addEventListener('click', this.#onConfirmMarker);
    $cancelButton?.addEventListener('click', this.#onCancelMarker);
    $fixButton?.addEventListener('click', this.#onFixMarker);
    $removeButton?.addEventListener('click', this.#onRemoveMarker);

    this.#targetElement = $div;

    const paens = this.overlayView.getPanes()!;
    paens.floatPane.appendChild(this.#targetElement);

    this.trigger(EVENTS.INIT_MARKER, {
      type: EVENTS.INIT_MARKER,
    });
  }
  draw() {
    const projection = this.overlayView.getProjection();

    if (!projection) {
      return;
    }

    const position = this.overlayView.get('position');
    const posPixel = projection.fromLatLngToDivPixel(position);

    if (!posPixel || !this.#targetElement) {
      return;
    }

    const edgePoint = this.#targetElement.querySelector('#edge-point') as HTMLDivElement;

    const circleCenterPosition = this.#targetElement.clientHeight - edgePoint.clientHeight + edgePoint.clientHeight / 2;

    this.#targetElement.style.left = `${posPixel.x - this.#targetElement.clientWidth / 2}px`;
    this.#targetElement.style.top = `${posPixel.y - circleCenterPosition}px`;
  }

  disableElement() {
    if (!this.#targetElement) {
      return;
    }

    this.#targetElement.draggable = false;
    this.#targetElement.style.cursor = 'pointer';
    this.#targetElement.removeEventListener('mousedown', this.#onMousedown!);

    const $controls = Array.from(
      this.#targetElement?.querySelectorAll('#controls button') as Iterable<Element> | ArrayLike<Element>
    ) as HTMLButtonElement[];

    $controls.forEach($button => {
      const visibility = window.getComputedStyle($button).getPropertyValue('visibility');

      if (visibility === 'visible') {
        $button.style.visibility = 'hidden';
        $button.style.position = 'absolute';
      }
    });

    this.#targetElement.style.opacity = '0.45';

    this.#status = SYNC_INFO_STATUS.CONFIRM;

    this.#targetElement.addEventListener('click', this.#onRevokeMarker);
  }

  revokeElement() {
    if (!this.#targetElement) {
      return;
    }

    this.#targetElement.draggable = true;
    this.#targetElement.style.cursor = 'move';
    this.#targetElement.addEventListener('mousedown', this.#onMousedown!);

    const $removeButton = this.#targetElement.querySelector('#remove-button') as HTMLButtonElement;

    this.#targetElement.style.opacity = '1';

    $removeButton.style.visibility = 'visible';
    $removeButton.style.position = 'relative';

    this.#status = SYNC_INFO_STATUS.REVOKE;

    this.#targetElement.removeEventListener('click', this.#onRevokeMarker);
  }
  onRemove() {
    if (!this.#targetElement || !this.#targetElement.parentNode) {
      return;
    }

    const confirmButton = this.#targetElement.querySelector('#confirm-button');
    const cancelButton = this.#targetElement.querySelector('#cancel-button');
    const fixButton = this.#targetElement.querySelector('#fix-button');
    const removeButton = this.#targetElement.querySelector('#remove-button');

    this.#targetElement.removeEventListener('click', this.#onRevokeMarker);
    confirmButton?.removeEventListener('click', this.#onConfirmMarker);
    cancelButton?.removeEventListener('click', this.#onCancelMarker);
    fixButton?.removeEventListener('click', this.#onFixMarker);
    removeButton?.removeEventListener('click', this.#onRemoveMarker);

    this.#targetElement.parentNode.removeChild(this.#targetElement);

    this.#targetElement = null;
  }
}
