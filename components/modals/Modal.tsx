import styles from './Modal.module.css'
import { FC, ReactNode, useEffect, useRef } from 'react'

type Props = {
  head: ReactNode
  footer: ReactNode
  children: ReactNode // TODO: workaround, but what? why? Shouldn't FC already include that?
  close: () => void
}

const Modal: FC<Props> = ({ head, children, footer, close }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If dropdown is open and the clicked target is not within the menu,
      if (ref && ref.current && !ref.current.contains(e.target)) {
        close()
      }
    }
    document.addEventListener('mousedown', checkIfClickedOutside)

    return () => {
      // Cleanup
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  })
  return (
    <div
      className={styles.modal + ' modal fade show'}
      tabIndex={-1}
      role={'dialog'}
    >
      <div className={'modal-dialog'}>
        <div className={styles.modalContent + ' modal-content'} ref={ref}>
          <div className={styles.header + ' modal-header'}>
            <h4 className={'modal-title'}>{head}</h4>
            <button
              type={'button'}
              className={styles.close + ' btn'}
              onClick={close}
              aria-label={'Close'}
            >
              &times;
            </button>
          </div>
          <div className={'modal-body'}>{children}</div>
          <div className={styles.footer + ' modal-footer'}>
            {footer}
            <button
              type={'button'}
              className={'btn btn-outline-secondary'}
              onClick={close}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
