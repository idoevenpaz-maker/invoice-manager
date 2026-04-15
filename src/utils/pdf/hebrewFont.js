import { Font } from '@react-pdf/renderer'

let registered = false

export function registerHebrewFont() {
  if (registered) return
  registered = true

  Font.register({
    family: 'NotoSansHebrew',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/notosanshebrew/v37/or3HQ7v33zm0CkMkAX20mcLealY5_CmBLqnAkBk7yEjB7GVKXKB.woff2',
        fontWeight: 400,
      },
      {
        src: 'https://fonts.gstatic.com/s/notosanshebrew/v37/or3HQ7v33zm0CkMkAX20mcLealY5_CmBLqnAkBk7yEjB7GOyXKB.woff2',
        fontWeight: 700,
      },
    ],
  })

  Font.registerHyphenationCallback(word => [word])
}
