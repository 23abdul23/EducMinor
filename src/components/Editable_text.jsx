import { useState } from 'react'

const EditableText = () => {
  const [value, setValue] = useState('Click to edit placeholder')
  const [isEditing, setIsEditing] = useState(false)

  const toggleEdit = () => setIsEditing((prev) => !prev)

  return (
    <div className="section-placeholder">
      {isEditing ? (
        <input value={value} onChange={(event) => setValue(event.target.value)} onBlur={toggleEdit} />
      ) : (
        <p onClick={toggleEdit}>{value}</p>
      )}
    </div>
  )
}

export default EditableText
