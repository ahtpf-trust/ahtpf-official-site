'use client'

/**
 * Generates a credit-card-sized PDF of the membership ID card at the template's
 * native resolution, so the downloaded PDF is as crisp as the on-screen preview
 * (and sharper — no down-sampling/resampling of the background template).
 *
 * How it works:
 *  - Clones the visible card element (e.g. "#membership-card-preview" or
 *    "#membership-card") and positions the clone off-screen.
 *  - Scales the clone up to the template's native pixel size (850×1215), and
 *    proportionally scales every child's inline/computed px styles so the
 *    layout is identical to the preview.
 *  - Captures the high-res clone with html2canvas at scale 2.
 *  - Emits it into a jsPDF page sized exactly like the card (full bleed,
 *    credit-card width, no margins).
 */

const NATIVE_TEMPLATE_WIDTH = 850
const NATIVE_TEMPLATE_HEIGHT = 1215

/** Inline style properties (px based) that need proportional scaling. */
const SCALABLE_PX_PROPS = [
  'left',
  'top',
  'right',
  'bottom',
  'width',
  'height',
  'fontSize',
  'minWidth',
  'minHeight',
  'marginLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
] as const

export async function generateIdCardPdf(cardElementId: string, memberName: string): Promise<void> {
  const cardElement = document.getElementById(cardElementId)
  if (!cardElement) {
    throw new Error('Card element not found.')
  }

  // Load client-only libs lazily (keeps Next.js SSR safe, matches existing pattern)
  const [html2canvasModule, jspdfModule] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const html2canvas = html2canvasModule.default
  const { jsPDF } = jspdfModule

  const sourceWidth = cardElement.offsetWidth
  const sourceHeight = cardElement.offsetHeight

  // Per-axis scale factors map the preview layout onto the native template size
  const scaleX = NATIVE_TEMPLATE_WIDTH / sourceWidth
  const scaleY = NATIVE_TEMPLATE_HEIGHT / sourceHeight

  // 1. Clone the card and park it off-screen at native resolution.
  //    Use absolute positioning (not fixed) — html2canvas captures
  //    absolutely-positioned off-screen elements reliably.
  const clone = cardElement.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  clone.style.position = 'absolute'
  clone.style.left = '-99999px'
  clone.style.top = '0px'
  clone.style.width = `${NATIVE_TEMPLATE_WIDTH}px`
  clone.style.height = `${NATIVE_TEMPLATE_HEIGHT}px`
  clone.style.zIndex = '-1'
  clone.style.pointerEvents = 'none'
  clone.style.margin = '0'
  clone.style.boxShadow = 'none' // avoid a clipped shadow ring on the full-bleed page

  // 2. Scale every child's inline + class-based computed styles proportionally
  const originalChildren = Array.from(cardElement.querySelectorAll('*'))
  const cloneChildren = Array.from(clone.querySelectorAll('*'))

  originalChildren.forEach((origEl, i) => {
    const cloneEl = cloneChildren[i] as HTMLElement | undefined
    if (!cloneEl) return

    const origElCasted = origEl as HTMLElement
    const oStyle = origElCasted.style
    const cStyle = cloneEl.style

    // Inline px values
    for (const prop of SCALABLE_PX_PROPS) {
      const val = oStyle[prop as keyof CSSStyleDeclaration] as string
      if (val && val.endsWith('px')) {
        const factor = prop === 'top' || prop === 'bottom' || prop === 'height'
          || prop === 'minHeight' || prop === 'marginTop' || prop === 'marginBottom'
          ? scaleY
          : scaleX
        const numeric = parseFloat(val)
        if (!Number.isNaN(numeric)) {
          ;(cStyle as any)[prop] = `${(numeric * factor).toFixed(2)}px`
        }
      }
    }

    // Class-based (Tailwind) paddings/gaps/border radius scale too, so the
    // centered text and rounded photo crop remain pixel-identical
    const cs = window.getComputedStyle(origElCasted)

    ;(['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'gap', 'borderRadius'] as const).forEach((prop) => {
      const numeric = parseFloat(cs[prop])
      if (!Number.isNaN(numeric) && numeric > 0) {
        const factor = prop === 'paddingTop' || prop === 'paddingBottom' ? scaleY : scaleX
        ;(cStyle as any)[prop] = `${(numeric * factor).toFixed(2)}px`
      }
    })

    // Preserve bold weight so the member name renders exactly like the preview
    if (cs.fontWeight) {
      cStyle.fontWeight = cs.fontWeight
    }
  })

  document.body.appendChild(clone)

  try {
    // 3. Rasterize the native-resolution clone.
    //    Template is now 850×1215 instead of 280×400 / 310×443 → no down-sampling.
    //    scale 2 → 1700×2430 canvas (~508 DPI at the physical card size).
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // 4. Credit-card-sized page (full bleed, no margins) preserving aspect ratio
    const cardWidth = 85.6 // mm — standard credit card width
    const cardHeight = cardWidth / (canvas.width / canvas.height)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [cardWidth, cardHeight],
    })

    pdf.addImage(imgData, 'JPEG', 0, 0, cardWidth, cardHeight)

    const cleanName = memberName.toLowerCase().replace(/\s+/g, '_')
    pdf.save(`member_card_${cleanName}.pdf`)
  } finally {
    // 5. Clean up the scratch clone
    clone.remove()
  }
}