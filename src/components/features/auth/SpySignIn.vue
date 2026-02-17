<script setup lang="ts">
import { inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user/profile'
import type { AxiosInstance } from 'axios'

const userStore = useUserStore()

const axios = inject('axios') as AxiosInstance
const route = useRoute()
const router = useRouter()

axios.get(`/spy/login/${route.params.token}`).then((response) => {
  userStore.fill(response.data?.data)
  router.push({ name: 'accountinformation' })
})
</script>
