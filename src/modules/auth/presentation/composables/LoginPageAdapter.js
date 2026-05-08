import LoginView from "@/modules/auth/presentation/pages/LoginView.vue";
import LoginForm from "@/modules/auth/presentation/components/LoginForm.vue";
import { provideLoginUseCase } from "@/modules/auth/application/containers/loginContainer";

export default {
  name: "LoginPageAdapter",
  components: { LoginView, LoginForm },
  methods: {
    async handleSubmit(credentials) {
      const useCase = provideLoginUseCase();
      try {
        const result = await useCase.execute(credentials);
        this.$router.push({ name: "dashboard" });
      } catch (e) {
        console.error(e);
      }
    },
  },
  template: `<LoginView><LoginForm @submit="handleSubmit" /></LoginView>`,
};
