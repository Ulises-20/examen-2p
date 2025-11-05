export function avatarUrl(participant) {
  // prefer explicit avatar if provided and looks like a URL
  if (participant?.avatar && participant.avatar.trim() !== '') {
    return participant.avatar
  }
  // default avatar when none provided (monochrome icon)
  return 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'
}
