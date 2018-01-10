import Vue from 'vue'
import { Route } from 'vue-router'

export class DotvueController extends Vue {

    public RouteLoadDataAsync : Route

    public RouteBeforeRouteUpdate : Route

    public RouteCreated : Route

    public static async LoadDataAsync(to: Route) {
        return null
    }

    public DotvueLoadDataAsync(to: Route){
        let controller = <typeof DotvueController>this.constructor
        return controller.LoadDataAsync(to)
    }

    public GetStaticClass(): typeof DotvueController {
        return <typeof DotvueController>this.constructor
    }

    public async beforeRouteUpdate(to: Route, from: Route, next: any) {
        let controller = <typeof DotvueController>this.constructor
        await controller.LoadDataAsync(to)
        next(true)
    }

    public created() {
        
    }

}
