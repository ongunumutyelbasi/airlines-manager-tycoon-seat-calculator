import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button(props: Props) {
  return (
    <button
      {...props}
      className={[
        'btn',
        'inline-block',
        'text-sm',
        'font-medium',
        (props.className || ''),
      ].join(' ')}
    />
  )
}
