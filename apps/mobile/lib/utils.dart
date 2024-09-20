String formatDate(DateTime? dateTime) {
    if (dateTime == null) return "";
    return ("${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour}:${dateTime.minute}");
  }