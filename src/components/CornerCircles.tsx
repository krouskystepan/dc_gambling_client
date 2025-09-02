const CornerCircles = () => {
  return (
    <>
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-green-700/25 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-red-800/25 blur-3xl animate-float-slow [animation-delay:8s]" />
    </>
  )
}

export default CornerCircles
