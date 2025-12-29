const userSteps = {
  async getUserPerPage(page = 2) {
    return {
      data: {
        data: [
          {
            email: "uak282006@gmail.com"
          }
        ]
      }
    };
  },

  async getUserById(id: number) {
    return {
      data: {
        data: [
          {
            email: "uak282006@gmail.com"
          }
        ]
      }
    };
  }
}

export default userSteps;
