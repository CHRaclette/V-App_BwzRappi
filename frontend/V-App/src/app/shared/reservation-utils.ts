export function participantsToApiValue(participants: string): string {
  if (!participants) {
    return ''
  }

  return participants
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
    .join(', ')
}

export function formatTimeTo12Hour(timeValue: string): string {
  if (!timeValue || !timeValue.includes(':')) {
    return timeValue || ''
  }

  const [hourPart, minutePart] = timeValue.split(':')
  const hour = Number(hourPart)
  const minute = Number(minutePart)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return timeValue
  }

  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  const minuteText = `${minute}`.padStart(2, '0')
  return `${hour12}:${minuteText} ${ampm}`
}

export function mapReservationToCard(reservation: any): any {
  const room = reservation.room || {}
  const features = [
    room.hasCamera ? 'Camera' : null,
    room.hasProjector ? 'Beamer' : null,
    room.hasTouchscreen ? 'Touchscreen' : null,
    room.hasWhiteboard ? 'Whiteboard' : null,
  ].filter(Boolean)

  return {
    ...reservation,
    locationLabel: `Room ${room.roomNumber || '-'}`,
    roomName: room.name || 'Unknown room',
    featuresLabel: features.length > 0 ? features.join(' • ') : 'No special equipment',
    startDisplay: formatTimeTo12Hour(reservation.startTime),
    endDisplay: formatTimeTo12Hour(reservation.endTime),
  }
}
