export const displayDate = (dateStr, withHours=false, dateObj=null) => {
    if (!dateStr && !dateObj)
        return '';
    const myDate = !dateObj ? new Date(dateStr) : dateObj;
    const fullDate = ('0' + myDate.getDate()).slice(-2) + '/'
    + ('0' + (myDate.getMonth() + 1)).slice(-2) + '/'
    + myDate.getFullYear();
  const fullHours = ('0' + myDate.getHours()).slice(-2) 
    + ':' + ('0' + myDate.getMinutes()).slice(-2)
    + ':' + ('0' + myDate.getSeconds()).slice(-2);
  return fullDate + (withHours ? ' ' + fullHours : '');
}