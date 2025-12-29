import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse
} from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, tap } from "rxjs/operators";
import { User } from "../../shared/class/user";


//get token
const token = localStorage.getItem('token');
const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json",
    })
};

@Injectable({
    providedIn: "root"
})
export class adminService {
    public currentUser: User;
    public staticPages: Array<object> = [];
    private apiUrl = `${environment.apiUrl}`;

    //get admin user id and send it with each request
    private loggedInUser_Id: Number = parseInt(localStorage.getItem("currentUserId"));

    constructor(private http: HttpClient) {
        this.currentUser = {
            id: 0,
            name: "",
            email: "",
            role: "",
            address: "",
            city: "",
            phone: "",
            status: 0,
            profilepic: ""
        };
    }

    dashboard() {
        const dashboard = `${environment.apiUrl}` + "/admin/dashboard?loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(dashboard, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    Setuserdata() {
        this.currentUser.profilepic = JSON.parse(localStorage.getItem('currentuser')).user.profileimage;
        this.currentUser.name = JSON.parse(localStorage.getItem('currentuser')).user.name;
    }

    // get Static pages Name
    getStaicPagesName() {
        this.staticPages = [];
        return this.http.get(`${environment.apiUrl}` + "/admin/staticPages?loggedInUser_Id=" + this.loggedInUser_Id, httpOptions).pipe(map((resp: any) => { this.staticPages = resp.pages }));
    }

    //Get current User LoggedIn for Admin panel
    getCurrentUser(userid) {
        const getuser = `${environment.apiUrl}` + "/user/getUserinfo?userid=" + userid + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(getuser, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    updateProfile(user) {
        const updateUSerUrl = this.apiUrl + "/admin/update?loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http
            .post<any>(`${updateUSerUrl}`, user)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )


    }

    getUserlist() {
        const getuserslist = this.apiUrl + "/admin/userlist?loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http
            .get(getuserslist, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )


    }
    updateuserProfile(user) {
        const updateUSerUrl = this.apiUrl + "/admin/updateUser?loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http
            .post<any>(`${updateUSerUrl}`, user)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )

    }

    createPage(data) {

        return this.http
            .post<any>(this.apiUrl + "/admin/createPage?loggedInUser_Id=" + this.loggedInUser_Id, data, httpOptions).pipe(map((resp: any) => {
                return resp;
            })
            )

    }

    getStaticpageContent(page_id) {
        const pagecontent = this.apiUrl + "/admin/getPagecontents?loggedInUser_Id=" + this.loggedInUser_Id + "&pageid=" + page_id;
        return this.http
            .get(pagecontent, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )
    }

    updatePage(data) {
        // data.loggedInUser_Id = this.loggedInUser_Id;
        const pageupdateUrl = this.apiUrl + "/admin/updatePage";
        return this.http
            .post<any>(`${pageupdateUrl}`, data, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )

    }


    changeStatus(data) {
        data.loggedInUser_Id = this.loggedInUser_Id;
        const changeStatus = this.apiUrl + "/admin/changeStatus";
        return this.http
            .post<any>(`${changeStatus}`, data, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )

    }

    getCategories() {
        const getCategories = this.apiUrl + "/user/getcategories?loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http
            .get(getCategories, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )

    }

    saveCategory(data) {
        return this.http.post(this.apiUrl + "/admin/savecategory?loggedInUser_Id=" + this.loggedInUser_Id, data)
            .pipe(map((res: any) => { return res }))

    }

    getCategory(catid) {
        return this.http.get(this.apiUrl + "/admin/getCategory?catid=" + catid + "&loggedInUser_Id=" + this.loggedInUser_Id, httpOptions).pipe(map((res: any) => { return res }))
    }

    deleteCat(catid) {
        return this.http.post(this.apiUrl + "/admin/deleteCat", { catid, loggedInUser_Id: this.loggedInUser_Id }, httpOptions).pipe(map((res: any) => { return res }))
    }
    deleteSubCat(catid) {
        return this.http.post(this.apiUrl + "/admin/deleteSubCat", { catid, loggedInUser_Id: this.loggedInUser_Id }, httpOptions).pipe(map((res: any) => { return res }))
    }
    deleteSuggestion(suggestionid) {
        return this.http.post(this.apiUrl + "/admin/delete-catsuggestion", { suggestionid, loggedInUser_Id: this.loggedInUser_Id }, httpOptions).pipe(map((res: any) => { return res }))
    }

    getSubCategories() {
        const getCategories = this.apiUrl + "/admin/getsubcategories?loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http
            .get(getCategories, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )
    }

    saveSubCategory(data) {
        data.loggedInUser_Id = this.loggedInUser_Id;
        return this.http.post(this.apiUrl + "/admin/savesubcategory", data, httpOptions)
            .pipe(map((res: any) => { return res }))

    }

    deletefeedback(feedback_id) {
        return this.http.get(this.apiUrl + '/admin/deletefeedback?feedback_id=' + feedback_id + "&loggedInUser_Id=" + this.loggedInUser_Id, httpOptions).pipe(map((res: any) => { return res }))
    }

    sendmsg(data) {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        data.loggedInUser_Id = this.loggedInUser_Id;
        return this.http.post<any>(`${this.apiUrl}` + "/admin/sendmsg", data, httpOptions).pipe(map((resp: any) => { return resp; }))
    }

    getnotifications(page) {
        const notiurl = `${environment.apiUrl}` + "/admin/getnotifications?page=" + page + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(notiurl, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    updateSetting(data) {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        // data.loggedInUser_Id = this.loggedInUser_Id;
        return this.http.post<any>(`${this.apiUrl}` + "/admin/updateSetting", data, httpOptions).pipe(map((resp: any) => { return resp; }))
    }

    getSetting() {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        return this.http.post<any>(`${this.apiUrl}` + "/admin/getSetting", { loggedInUser_Id: this.loggedInUser_Id }, httpOptions).pipe(map((resp: any) => { return resp; }))
    }

    getfaqlist() {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        return this.http.post<any>(`${this.apiUrl}` + "/admin/getfaqlist", { loggedInUser_Id: this.loggedInUser_Id }, httpOptions).pipe(map((resp: any) => { return resp; }))
    }

    addFaq(data) {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        data.loggedInUser_Id = this.loggedInUser_Id;
        return this.http.post<any>(`${this.apiUrl}` + "/admin/addfaq", data, httpOptions).pipe(map((resp: any) => { return resp; }))
    }
    getfaq(id) {
        const apiurl = `${environment.apiUrl}` + "/admin/getfaq?faq_id=" + id + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(apiurl, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }
    deletefaq(id) {
        const apiurl = `${environment.apiUrl}` + "/admin/deletefaq?faq_id=" + id + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(apiurl, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    getdriverDetail(driver_id) {
        const apiurl = `${environment.apiUrl}` + "/admin/drive?driver_id=" + driver_id + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(apiurl, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    getresregDetail(id) {
        const apiurl = `${environment.apiUrl}` + "/admin/getresreg?id=" + id + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(apiurl, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    SetWebdata(data) {
        return this.http.post<any>(`${this.apiUrl}` + "/admin/SetWebdata", data).pipe(map((resp: any) => { return resp; }))
    }

    paydriver(id) {
        return this.http.post<any>(`${this.apiUrl}` + "/admin/paydriver", { id, loggedInUser_Id: this.loggedInUser_Id }).pipe(map((resp: any) => { return resp; }))
    }

    uploadInvoiceImages(formData) {
        return this.http.post<any>(`${this.apiUrl}` + "/admin/invoiceImages", formData).pipe(map((resp: any) => { return resp; }))
    }

}
