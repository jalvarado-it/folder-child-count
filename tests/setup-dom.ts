/**
 * jsdom shim for the subset of Obsidian's DOM helpers used by `src/badge.ts`.
 *
 * Obsidian augments `Element.prototype` with helpers such as `createSpan()`,
 * `createDiv()` and `setText()`. jsdom does not, so we implement just enough of
 * them to run the DOM tests. Kept intentionally small and dependency-free.
 */

type DomInfo =
	| string
	| {
			cls?: string | string[];
			text?: string;
			attr?: Record<string, string>;
	  };

interface ObsidianDomHelpers {
	createSpan(info?: DomInfo): HTMLSpanElement;
	createDiv(info?: DomInfo): HTMLDivElement;
	setText(text: string): void;
}

function applyInfo(el: HTMLElement, info?: DomInfo): void {
	if (typeof info === 'string') {
		el.className = info;
		return;
	}
	if (!info) {
		return;
	}
	if (info.cls !== undefined) {
		const classes = Array.isArray(info.cls) ? info.cls : info.cls.split(/\s+/);
		el.classList.add(...classes.filter(Boolean));
	}
	if (info.text !== undefined) {
		el.textContent = info.text;
	}
	if (info.attr) {
		for (const [key, value] of Object.entries(info.attr)) {
			el.setAttribute(key, value);
		}
	}
}

const proto = Element.prototype as unknown as ObsidianDomHelpers;

if (typeof proto.createSpan !== 'function') {
	proto.createSpan = function (
		this: Element,
		info?: DomInfo,
	): HTMLSpanElement {
		const el = this.ownerDocument.createElement('span');
		applyInfo(el, info);
		this.appendChild(el);
		return el;
	};
}

if (typeof proto.createDiv !== 'function') {
	proto.createDiv = function (
		this: Element,
		info?: DomInfo,
	): HTMLDivElement {
		const el = this.ownerDocument.createElement('div');
		applyInfo(el, info);
		this.appendChild(el);
		return el;
	};
}

if (typeof proto.setText !== 'function') {
	proto.setText = function (this: Element, text: string): void {
		this.textContent = String(text);
	};
}
