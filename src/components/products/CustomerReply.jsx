import { useId, useState } from 'react'
import { PRODUCT_STATUS } from '../../data/products'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'

const REPLY_LABELS = {
  [PRODUCT_STATUS.APPROVED]: 'Approved',
  [PRODUCT_STATUS.REJECTED]: 'Rejected',
  [PRODUCT_STATUS.CHANGES]: 'Requested changes',
}

const REPLY_STYLES = {
  [PRODUCT_STATUS.APPROVED]: {
    border: 'border-accent-1',
    badge: 'border-accent-1 bg-accent-1-lighter text-text',
  },
  [PRODUCT_STATUS.REJECTED]: {
    border: 'border-accent-2',
    badge: 'border-accent-2 bg-accent-2-lighter text-text',
  },
  [PRODUCT_STATUS.CHANGES]: {
    border: 'border-accent-3',
    badge: 'border-accent-3 bg-accent-3-lighter text-text',
  },
}

export default function CustomerReply({
  reply,
  status,
  showForm = false,
  onSubmit,
}) {
  const commentId = useId()
  const [comment, setComment] = useState(reply?.comment ?? '')
  const replyStatus = reply?.status ?? status
  const styles = REPLY_STYLES[replyStatus]
  const label = REPLY_LABELS[replyStatus]

  if (!styles || (!reply?.comment && !showForm)) {
    return null
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedComment = comment.trim()

    if (!trimmedComment) {
      return
    }

    onSubmit?.({
      status: replyStatus,
      comment: trimmedComment,
    })
  }

  return (
    <section className="mt-4 border-t border-text pt-4" aria-label="Customer reply">
      <div
        className={cn(
          'rounded-xl border-2 bg-background-third px-4 py-3 text-text',
          styles.border,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h4 className="m-0 font-body text-base font-bold text-text">
            Customer Reply
          </h4>
          <span
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium',
              styles.badge,
            )}
          >
            {label}
          </span>
        </div>

        {reply?.comment ? (
          <p className="m-0 mt-4 font-body text-base leading-snug text-text">
            {reply.comment}
          </p>
        ) : null}

        {showForm ? (
          <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={commentId}>
              Customer reply comment
            </label>
            <textarea
              id={commentId}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className={cn(
                'min-h-24 resize-y rounded-xl border border-background-third bg-background px-3 py-2 font-body text-sm text-text outline-none',
                'focus:border-text',
              )}
            />
            <Button
              type="submit"
            >
              Submit reply
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  )
}
