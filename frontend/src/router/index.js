import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import StudentHomeLayout from "../layouts/StudentHomeLayout.vue";
import StudentDashboardLayout from "../layouts/StudentDashboardLayout.vue";
import StudentHomeView from "../views/student/HomeView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "login",
    component: LoginView
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView
  },
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      {
        path: "",
        redirect: "/admin/users"
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("../views/admin/UserManageView.vue")
      },
      {
        path: "schedules",
        name: "admin-schedules",
        component: () => import("../views/admin/ScheduleManageView.vue")
      },
      {
        path: "profile",
        name: "admin-profile",
        component: () => import("../views/admin/ProfileView.vue")
      },
      {
        path: "articles",
        name: "admin-articles",
        component: () => import("../views/admin/ArticlesView.vue"),
        meta: {
          title: '文章管理',
          requiresAuth: true,
          role: 'admin'
        }
      },
      {
        path: "assessment",
        name: "admin-assessment",
        component: () => import("../views/admin/AssessmentQuestionManageView.vue"),
        meta: {
          title: '测评管理',
          requiresAuth: true,
          role: 'admin'
        }
      },
      {
        path: "statistics",
        name: "admin-statistics",
        component: () => import("../views/admin/DataAnalysisView.vue"),
        meta: {
          title: '数据统计',
          requiresAuth: true,
          role: 'admin'
        }
      }
    ]
  },
  {
    path: "/student",
    component: StudentHomeLayout,
    children: [
      {
        path: "",
        name: "student-home",
        component: StudentHomeView
      },
      {
        path: "counselors",
        name: "student-counselors",
        component: () => import("../views/student/CounselorsView.vue")
      },
      {
        path: "counselors/:id",
        name: "counselor-detail",
        component: () => import("../views/student/counselors/CounselorDetailView.vue")
      },
      {
        path: "counselors/:id/appointment",
        name: "counselor-appointment",
        component: () => import("../views/student/counselors/AppointmentView.vue")
      },
      {
        path: "assessments",
        name: "student-assessments",
        component: () => import("../views/student/AssessmentsView.vue")
      },
      {
        path: "assessments/process/:type",
        name: "assessment-process",
        component: () => import("../views/student/AssessmentProcessView.vue")
      },
      {
        path: "assessments/result/:id",
        name: "assessment-result",
        component: () => import("../views/student/AssessmentResultView.vue")
      },
      {
        path: "articles",
        name: "student-articles",
        component: () => import("../views/student/ArticlesView.vue")
      }
    ]
  },
  {
    path: "/student/dashboard",
    component: StudentDashboardLayout,
    children: [
      {
        path: "",
        redirect: "/student/dashboard/profile"
      },
      {
        path: "profile",
        name: "student-profile",
        component: () => import("../views/student/dashboard/ProfileView.vue")
      },
      {
        path: "appointments",
        name: "student-appointments",
        component: () => import("../views/student/dashboard/AppointmentsView.vue")
      },
      {
        path: "assessments",
        name: "student-dashboard-assessments",
        component: () => import("../views/student/dashboard/AssessmentsView.vue")
      },
      {
        path: "articles",
        name: "student-dashboard-articles",
        component: () => import("../views/student/dashboard/ArticlesView.vue")
      },
      {
        path: 'appointments/:id',
        name: 'StudentAppointmentDetail',
        component: () => import('@/views/student/dashboard/AppointmentDetailView.vue')
      }
    ]
  },
  {
    path: "/counselor",
    component: () => import("../layouts/CounselorLayout.vue"),
    children: [
      {
        path: "",
        redirect: "/counselor/appointments"
      },
      {
        path: "appointments",
        name: "counselor-appointments",
        component: () => import("../views/counselor/AppointmentsView.vue")
      },
      {
        path: "appointments/:id",
        name: "counselor-appointment-detail",
        component: () => import("../views/counselor/AppointmentDetailView.vue")
      },
      {
        path: "schedule",
        name: "counselor-schedule",
        component: () => import("../views/counselor/ScheduleView.vue"),
        meta: {
          title: '排班信息',
          requiresAuth: true,
          role: 'counselor'
        }
      },
      {
        path: "profile",
        name: "counselor-profile",
        component: () => import("../views/counselor/ProfileView.vue")
      },
      {
        path: "articles",
        name: "counselor-articles",
        component: () => import("../views/counselor/ArticlesView.vue"),
        meta: {
          title: '文章管理',
          requiresAuth: true,
          role: 'counselor'
        }
      },
      {
        path: "assessments",
        name: "counselor-assessments",
        component: () => import("../views/counselor/StudentAssessmentsView.vue"),
        meta: {
          title: '学生测评',
          requiresAuth: true,
          role: 'counselor'
        }
      },
      {
        path: "assessment/:id",
        name: "counselor-assessment-detail",
        component: () => import("../views/counselor/AssessmentDetailView.vue"),
        meta: {
          title: '测评详情',
          requiresAuth: true,
          role: 'counselor'
        }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
