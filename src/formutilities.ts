export class FormUtilities {
    // TODO: More strict password requirements
    public static ValidatePassword(
        passwordInput: HTMLInputElement,
        passwordAgainInput: HTMLInputElement,
        submitButton: HTMLButtonElement
    ) {
        if (passwordInput.value == passwordAgainInput.value && passwordInput.value.length > 0)
            submitButton.disabled = false;
        else
            submitButton.disabled = true;
    }
}