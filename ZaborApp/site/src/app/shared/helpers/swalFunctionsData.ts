export const SwalSuccessToast: any = (title) => {
    return {
        icon: 'success',
        position: 'top-end',
        title: title,
        showConfirmButton: false,
        timer: 5000,
        toast: true,
        timerProgressBar: true,
    }
};

export const SwalErrorToast: any = (title, timer = 5000) => {
    return {
        icon: 'error',
        position: 'top-end',
        title: "Oops",
        text: title,
        showConfirmButton: false,
        timer,
        toast: true,
        timerProgressBar: true,
    }
};

export const SwalWarnToast: any = (title) => {
    return {
        icon: 'warning',
        position: 'top-end',
        title: "Warning",
        text: title,
        showConfirmButton: false,
        timer: 5000,
        toast: true,
        timerProgressBar: true,
    }
};

export const SwalConfirm: any = (text) => {
    return {
        title: 'Are you sure?',
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }
}

export const SwalInfoHtml: any = (html, title = 'Are you sure?') => {
  return {
    title,
    html,
    icon: 'info',
    showCancelButton: false,
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Ok'
  }
}
