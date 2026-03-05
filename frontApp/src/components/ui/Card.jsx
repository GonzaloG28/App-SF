const Card = ({ children }) => {
  return (
    <div className="bg-white p-12 rounded-3xl shadow-2xl text-center backdrop-blur-md">
      {children}
    </div>
  )
}

export default Card