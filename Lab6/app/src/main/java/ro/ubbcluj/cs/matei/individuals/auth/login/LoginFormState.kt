package ro.ubbcluj.cs.matei.individuals.auth.login

data class LoginFormState(
    val usernameError: Int? = null,
    val passwordError: Int? = null,
    val isDataValid: Boolean = false
)
