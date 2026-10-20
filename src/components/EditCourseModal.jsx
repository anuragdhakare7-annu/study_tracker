import { useRef } from 'react'
import CourseForm from './CourseForm.jsx'
import Modal from './Modal.jsx'

export default function EditCourseModal({ course, onSubmit, onClose }) {
  const nameRef = useRef(null)

  return (
    <Modal
      title="Edit subject"
      description="Update the name or lecture counts. Completed lectures can’t exceed the total."
      onClose={onClose}
      initialFocusRef={nameRef}
    >
      <CourseForm
        initialValues={{
          name: course.name,
          total: String(course.total),
          completed: String(course.completed),
        }}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        onCancel={onClose}
        nameInputRef={nameRef}
      />
    </Modal>
  )
}
