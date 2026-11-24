<?php

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('missing web page renders the branded 404 error page', function () {
    $this->get('/a-page-that-does-not-exist')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/show')
            ->where('status', 404)
        );
});

test('forbidden web page renders the branded 403 error page', function () {
    Route::middleware('web')->get('/_tests/error-forbidden', function () {
        abort(403, 'Internal permission details must not be shown');
    });

    $this->get('/_tests/error-forbidden')
        ->assertForbidden()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/show')
            ->where('status', 403)
            ->missing('message')
        );
});

test('json consumers still receive json instead of an inertia error page', function () {
    $this->getJson('/a-page-that-does-not-exist')
        ->assertNotFound()
        ->assertHeader('content-type', 'application/json');
});

test('post validation and errors are not replaced by a branded page', function () {
    Route::middleware('web')->post('/_tests/error-invalid-post', function () {
        abort(403);
    });

    $this->post('/_tests/error-invalid-post')
        ->assertForbidden();
});
