import React from "react"
import axios from "axios"

class LoginComponent extends React.Component {
    constructor() {
        super()

        this.state = {
            username: "",
            password: ""
        }
    }

    register = e => {
        e.preventDefault()

        axios
            .post("https://localhost:5000/api/register", this.state)
            .then(res => console.log(res).catch(err => console.log(err)))
    }

    handleInput = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    render() {
        return (
            <div>
                <form onSubmit={this.register}>
                    <input
                        type="text"
                        name="username"
                        value={this.state.username}
                        onChange={this.handleInput}
                        placeholder="username"
                    />
                    <input
                        type="text"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleInput}
                        placeholder="password"
                    />
                    <button type="submit">submit</button>
                </form>
            </div>
        )
    }
}

export default LoginComponent
