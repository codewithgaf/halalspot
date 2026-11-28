<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', Rule::in(['active', 'suspended'])],
            'role' => ['nullable', 'string', Rule::in(['user', 'moderator', 'administrator'])],
        ]);

        $search = trim($validated['search'] ?? '');
        $status = $validated['status'] ?? null;
        $role = $validated['role'] ?? null;

        $users = User::query()
            ->select(['id', 'name', 'email', 'account_status', 'created_at'])
            ->with('roles:id,name,guard_name')
            ->when($search !== '', fn (Builder $query) => $this->applySearch($query, $search))
            ->when($status !== null, fn (Builder $query) => $query->where('account_status', $status))
            ->when($role !== null, fn (Builder $query) => $query->role($role))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => $this->toDirectoryUser($user));

        // Global counts are separate from the filtered, paginated directory.
        $stats = [
            'totalAccounts' => User::query()->count(),
            'activeAccounts' => User::query()->where('account_status', 'active')->count(),
            'suspendedAccounts' => User::query()->where('account_status', 'suspended')->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => ['search' => $search, 'status' => $status, 'role' => $role],
            'stats' => $stats,
        ]);
    }

    public function show(User $user): Response
    {
        $account = User::query()
            ->select([
                'id',
                'name',
                'email',
                'account_status',
                'email_verified_at',
                'created_at',
            ])
            ->with('roles:id,name,guard_name')
            ->findOrFail($user->id);

        return Inertia::render('admin/users/show', [
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'email' => $account->email,
                'account_status' => $account->account_status,
                'roles' => $account->roles
                    ->pluck('name')
                    ->values()
                    ->all(),
                'email_verified' => $account->email_verified_at !== null,
                'created_at' => $account->created_at?->toISOString(),
            ],
        ]);
    }

    /** @param Builder<User> $query */
    private function applySearch(Builder $query, string $search): void
    {
        // Bound LIKE value prevents SQL injection. Escape wildcard characters
        // so a user searching '%' or '_' gets a literal match.
        $escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($search));
        $term = '%'.$escaped.'%';

        $query->where(function (Builder $query) use ($term): void {
            $query->whereRaw("LOWER(name) LIKE ? ESCAPE '!'", [$term])
                ->orWhereRaw("LOWER(email) LIKE ? ESCAPE '!'", [$term]);
        });
    }

    /** @return array{id: int, name: string, email: string, account_status: string, roles: array<int, string>, created_at: string|null} */
    private function toDirectoryUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'account_status' => $user->account_status,
            'roles' => $user->roles->pluck('name')->values()->all(),
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}
