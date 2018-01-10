import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import DotvueInitialData from './DotvueInitialData'

export let routeInitialDataMap = new Map<Route, DotvueInitialData<any>>();

export default class DotvueApp {

    initLoad: Promise<any>

    initialData = new Map<string, DotvueInitialData<any>>();

    ssrData: { [key: string]: any } = {};

    routesInMap = new Array<Route>();

    vueComponent: Vue

    constructor(router: VueRouter, template: string) {

        this.vueComponent = new Vue({
            router,
            template: template,
            computed: {
                dotvueApp: () => { return this }
            }
        })

        this.initLoad = new Promise((resolve, reject) => {
            router.onReady(resolve, reject)
        })

        router.beforeEach(async (to: Route, from: Route, next: any) => {
            let matchedComponents = router.getMatchedComponents()

            if (!matchedComponents.length) {
                throw new Error("Not found")
            }

            let promises = new Array<Promise<void>>();
            let i=0

            let initialData = this.initialData
            let ssrData = this.ssrData
            
            matchedComponents.map(Component => {
                let dotvueLoadDataAsyncFunction = (Component as any).options.methods.DotvueLoadDataAsync
                if (dotvueLoadDataAsyncFunction) {
                    promises.push((async (key: string) => {
                        if (ssrData[key]){
                            initialData.set(key, ssrData[key])
                            delete ssrData[key]
                        } else {
                            let data = await dotvueLoadDataAsyncFunction(to)
                            initialData.set(key, data)
                            ssrData[key] = data
                        }
                        (Component as any).options.methods.loadDataAsync = (to:Route) => {
                            console.log("overridden")
                            if (initialData.has(key)){
                                let data = initialData.get(key)
                                initialData.delete(key)
                                console.log("from SSR")
                                return data
                            }
                            console.log("from Source")
                            return loadDataAsyncFunction(to);
                        }
                    })(String(i)))
                    i++
                }
            })

        await Promise.all<void>(promises)
            next(true)
        })

        router.afterEach((to: Route, from: Route) => {

        })
    }

    private async _beforeRoute(router: VueRouter, resolve: any, reject: any) {
        
    }

}
