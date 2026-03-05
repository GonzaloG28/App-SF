const Button = ({ children }) => {
  return (
    <button
      className="
        px-8 py-4 
        rounded-xl 
        bg-blue-600 
        hover:bg-blue-700 
        active:scale-95 
        transition-all 
        duration-200 
        text-white 
        font-semibold 
        text-lg 
        shadow-lg
      "
    >
      {children}
    </button>
  )
}

export default Button