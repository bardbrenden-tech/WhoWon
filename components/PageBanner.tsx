import Image from 'next/image'

interface Props {
  title: string
  subtitle?: string
}

export default function PageBanner({ title, subtitle }: Props) {
  return (
    <div className="relative overflow-hidden py-14 px-4 text-center">
      <Image src="/images/Background.jpg" alt="" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{title}</h1>
        {subtitle && <p className="text-gray-300 mt-2 text-sm">{subtitle}</p>}
      </div>
    </div>
  )
}
